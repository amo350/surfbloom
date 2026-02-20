import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

const AUDIENCE_TYPES = ["all", "stage", "category", "inactive"] as const;
const STATUSES = [
  "draft",
  "scheduled",
  "sending",
  "paused",
  "completed",
  "cancelled",
] as const;

function deriveGroupStatus(statuses: string[]) {
  if (statuses.length === 0) return "draft";
  if (statuses.includes("sending")) return "sending";
  if (statuses.includes("paused")) return "paused";
  if (statuses.every((s) => s === "cancelled")) return "cancelled";
  if (statuses.every((s) => s === "completed")) return "completed";
  if (statuses.includes("scheduled")) return "scheduled";
  return "draft";
}

// Shared audience query builder
async function buildAudienceWhere(
  workspaceId: string,
  audienceType: string,
  opts: {
    audienceStage?: string | null;
    audienceCategoryId?: string | null;
    audienceInactiveDays?: number | null;
    frequencyCapDays?: number | null;
  },
) {
  const where: any = {
    workspaceId,
    isContact: true,
    optedOut: false,
    phone: { not: null },
  };

  switch (audienceType) {
    case "stage":
      if (opts.audienceStage) where.stage = opts.audienceStage;
      break;
    case "category":
      if (opts.audienceCategoryId) {
        where.categories = {
          some: { categoryId: opts.audienceCategoryId },
        };
      }
      break;
    case "inactive":
      if (opts.audienceInactiveDays) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - opts.audienceInactiveDays);
        where.OR = [
          { lastContactedAt: { lt: cutoff } },
          { lastContactedAt: null },
        ];
      }
      break;
    case "all":
    default:
      break;
  }

  // Frequency cap — exclude contacts messaged recently
  if (opts.frequencyCapDays) {
    const capCutoff = new Date();
    capCutoff.setDate(capCutoff.getDate() - opts.frequencyCapDays);

    const recentlyMessaged = await prisma.campaignRecipient.findMany({
      where: {
        sentAt: { gte: capCutoff },
        status: { in: ["sent", "delivered", "replied"] },
        contact: { workspaceId },
      },
      select: { contactId: true },
      distinct: ["contactId"],
    });

    const excludeIds = recentlyMessaged.map((r) => r.contactId);
    if (excludeIds.length > 0) {
      where.id = { notIn: excludeIds };
    }
  }

  return where;
}

export const campaignsRouter = createTRPCRouter({
  // ─── LIST ─────────────────────────────────────────────
  getCampaigns: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().optional(),
        status: z.enum(STATUSES).optional(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;

      const userWorkspaces = await prisma.member.findMany({
        where: { userId: ctx.auth.user.id },
        select: { workspaceId: true },
      });
      const workspaceIds = input.workspaceId
        ? [input.workspaceId]
        : userWorkspaces.map((m) => m.workspaceId);

      // Workspace-scoped lists always return campaigns only.
      if (input.workspaceId) {
        const where: any = {
          workspaceId: { in: workspaceIds },
        };
        if (input.status) where.status = input.status;

        const [campaigns, totalCount] = await Promise.all([
          prisma.campaign.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
              workspace: { select: { id: true, name: true } },
              createdBy: { select: { id: true, name: true } },
            },
          }),
          prisma.campaign.count({ where }),
        ]);

        return {
          items: campaigns.map((campaign) => ({
            ...campaign,
            type: "campaign",
          })),
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        };
      }

      // Index list merges standalone campaigns and campaign groups.
      const campaignWhere: any = {
        workspaceId: { in: workspaceIds },
        groupId: null,
      };
      if (input.status) campaignWhere.status = input.status;

      const groupWhere: any = {
        createdById: ctx.auth.user.id,
        campaigns: {
          some: {
            workspaceId: { in: workspaceIds },
          },
        },
      };

      const [standaloneCampaigns, groups] = await Promise.all([
        prisma.campaign.findMany({
          where: campaignWhere,
          orderBy: { createdAt: "desc" },
          include: {
            workspace: { select: { id: true, name: true } },
            createdBy: { select: { id: true, name: true } },
          },
        }),
        prisma.campaignGroup.findMany({
          where: groupWhere,
          orderBy: { createdAt: "desc" },
          include: {
            campaigns: {
              where: {
                workspaceId: { in: workspaceIds },
              },
              include: {
                workspace: { select: { id: true, name: true } },
                createdBy: { select: { id: true, name: true } },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        }),
      ]);

      const groupItems = groups
        .filter((group) =>
          input.status
            ? group.campaigns.some(
                (campaign) => campaign.status === input.status,
              )
            : true,
        )
        .map((group) => {
          const statuses = group.campaigns.map((campaign) => campaign.status);
          const totalRecipients = group.campaigns.reduce(
            (sum, campaign) => sum + campaign.totalRecipients,
            0,
          );
          const sentCount = group.campaigns.reduce(
            (sum, campaign) => sum + campaign.sentCount,
            0,
          );
          const deliveredCount = group.campaigns.reduce(
            (sum, campaign) => sum + campaign.deliveredCount,
            0,
          );
          const repliedCount = group.campaigns.reduce(
            (sum, campaign) => sum + campaign.repliedCount,
            0,
          );

          return {
            id: group.id,
            type: "group",
            name: group.name,
            status: deriveGroupStatus(statuses),
            messageTemplate: group.campaigns[0]?.messageTemplate ?? "",
            workspace: { id: "multiple", name: "Multiple locations" },
            totalRecipients,
            sentCount,
            deliveredCount,
            repliedCount,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
            campaignCount: group.campaigns.length,
            campaigns: group.campaigns,
          };
        });

      const standaloneItems = standaloneCampaigns.map((campaign) => ({
        ...campaign,
        type: "campaign",
      }));

      const merged = [...groupItems, ...standaloneItems].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      const totalCount = merged.length;
      const paged = merged.slice((page - 1) * pageSize, page * pageSize);

      return {
        items: paged,
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    }),

  // ─── GET ──────────────────────────────────────────────
  getCampaign: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const campaign = await prisma.campaign.findUnique({
        where: { id: input.id },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              twilioPhoneNumber: { select: { phoneNumber: true } },
            },
          },
          createdBy: { select: { id: true, name: true } },
          _count: {
            select: { recipients: true },
          },
        },
      });

      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });

      // Verify access
      const member = await prisma.member.findFirst({
        where: {
          userId: ctx.auth.user.id,
          workspaceId: campaign.workspaceId,
        },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      return campaign;
    }),

  // ─── CREATE ───────────────────────────────────────────
  createCampaign: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        name: z.string().trim().min(1).max(100),
        messageTemplate: z.string().trim().min(1).max(1600),
        audienceType: z.enum(AUDIENCE_TYPES).default("all"),
        audienceStage: z.string().optional(),
        audienceCategoryId: z.string().optional(),
        audienceInactiveDays: z.number().int().min(1).optional(),
        frequencyCapDays: z.number().int().min(1).optional(),
        scheduledAt: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify membership
      const member = await prisma.member.findFirst({
        where: {
          userId: ctx.auth.user.id,
          workspaceId: input.workspaceId,
        },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      // Verify workspace has a Twilio number
      const workspace = await prisma.workspace.findUnique({
        where: { id: input.workspaceId },
        select: {
          twilioPhoneNumber: { select: { phoneNumber: true } },
        },
      });
      if (!workspace?.twilioPhoneNumber?.phoneNumber) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This location needs an SMS number before sending campaigns",
        });
      }

      const status = input.scheduledAt ? "scheduled" : "draft";

      return prisma.campaign.create({
        data: {
          workspaceId: input.workspaceId,
          createdById: ctx.auth.user.id,
          name: input.name,
          messageTemplate: input.messageTemplate,
          audienceType: input.audienceType,
          audienceStage: input.audienceStage || null,
          audienceCategoryId: input.audienceCategoryId || null,
          audienceInactiveDays: input.audienceInactiveDays || null,
          frequencyCapDays: input.frequencyCapDays || null,
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
          status,
        },
      });
    }),

  createCampaignGroup: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(100),
        workspaceIds: z.array(z.string()).min(2),
        messageTemplate: z.string().trim().min(1).max(1600),
        audienceType: z.enum(AUDIENCE_TYPES).default("all"),
        audienceStage: z.string().optional(),
        audienceCategoryId: z.string().optional(),
        audienceInactiveDays: z.number().int().min(1).optional(),
        frequencyCapDays: z.number().int().min(1).optional(),
        scheduledAt: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceIds = [...new Set(input.workspaceIds)];
      if (workspaceIds.length < 2) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select at least 2 locations for a grouped campaign",
        });
      }

      const memberships = await prisma.member.findMany({
        where: {
          userId: ctx.auth.user.id,
          workspaceId: { in: workspaceIds },
        },
        select: { workspaceId: true },
      });
      if (memberships.length !== workspaceIds.length) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to all selected locations",
        });
      }

      const workspaces = await prisma.workspace.findMany({
        where: { id: { in: workspaceIds } },
        select: {
          id: true,
          name: true,
          twilioPhoneNumber: { select: { phoneNumber: true } },
        },
      });
      const missingNumber = workspaces
        .filter((w) => !w.twilioPhoneNumber?.phoneNumber)
        .map((w) => w.name);
      if (missingNumber.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Missing SMS number for: ${missingNumber.join(", ")}`,
        });
      }

      const status = input.scheduledAt ? "scheduled" : "draft";
      return prisma.$transaction(async (tx) => {
        const group = await tx.campaignGroup.create({
          data: {
            createdById: ctx.auth.user.id,
            name: input.name,
          },
        });

        await tx.campaign.createMany({
          data: workspaceIds.map((workspaceId) => ({
            groupId: group.id,
            workspaceId,
            createdById: ctx.auth.user.id,
            name: input.name,
            messageTemplate: input.messageTemplate,
            audienceType: input.audienceType,
            audienceStage: input.audienceStage || null,
            audienceCategoryId: input.audienceCategoryId || null,
            audienceInactiveDays: input.audienceInactiveDays || null,
            frequencyCapDays: input.frequencyCapDays || null,
            scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
            status,
          })),
        });

        return group;
      });
    }),

  getCampaignGroup: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const group = await prisma.campaignGroup.findUnique({
        where: { id: input.id },
        include: {
          campaigns: {
            include: {
              workspace: {
                select: {
                  id: true,
                  name: true,
                  twilioPhoneNumber: { select: { phoneNumber: true } },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      if (!group) throw new TRPCError({ code: "NOT_FOUND" });

      const memberships = await prisma.member.findMany({
        where: { userId: ctx.auth.user.id },
        select: { workspaceId: true },
      });
      const visibleWorkspaceIds = new Set(
        memberships.map((m) => m.workspaceId),
      );
      const visibleCampaigns = group.campaigns.filter((campaign) =>
        visibleWorkspaceIds.has(campaign.workspaceId),
      );
      if (visibleCampaigns.length === 0) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return {
        id: group.id,
        name: group.name,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        status: deriveGroupStatus(visibleCampaigns.map((c) => c.status)),
        campaigns: visibleCampaigns,
        totals: {
          recipients: visibleCampaigns.reduce(
            (sum, campaign) => sum + campaign.totalRecipients,
            0,
          ),
          sent: visibleCampaigns.reduce(
            (sum, campaign) => sum + campaign.sentCount,
            0,
          ),
          delivered: visibleCampaigns.reduce(
            (sum, campaign) => sum + campaign.deliveredCount,
            0,
          ),
          replied: visibleCampaigns.reduce(
            (sum, campaign) => sum + campaign.repliedCount,
            0,
          ),
        },
      };
    }),

  // ─── UPDATE ───────────────────────────────────────────
  updateCampaign: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1).max(100).optional(),
        messageTemplate: z.string().trim().min(1).max(1600).optional(),
        audienceType: z.enum(AUDIENCE_TYPES).optional(),
        audienceStage: z.string().nullable().optional(),
        audienceCategoryId: z.string().nullable().optional(),
        audienceInactiveDays: z.number().int().min(1).nullable().optional(),
        frequencyCapDays: z.number().int().min(1).nullable().optional(),
        scheduledAt: z.string().datetime().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const campaign = await prisma.campaign.findUnique({
        where: { id: input.id },
        select: { workspaceId: true, status: true },
      });
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });

      // Only draft/scheduled can be edited
      if (!["draft", "scheduled"].includes(campaign.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only edit draft or scheduled campaigns",
        });
      }

      const member = await prisma.member.findFirst({
        where: {
          userId: ctx.auth.user.id,
          workspaceId: campaign.workspaceId,
        },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      const { id, ...data } = input;

      // If scheduledAt is being set, update status
      if (data.scheduledAt !== undefined) {
        (data as any).status = data.scheduledAt ? "scheduled" : "draft";
      }

      return prisma.campaign.update({
        where: { id },
        data,
      });
    }),

  // ─── DELETE ───────────────────────────────────────────
  deleteCampaign: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await prisma.campaign.findUnique({
        where: { id: input.id },
        select: { workspaceId: true, status: true },
      });
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });

      // Can't delete while sending
      if (campaign.status === "sending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete a campaign that is currently sending",
        });
      }

      const member = await prisma.member.findFirst({
        where: {
          userId: ctx.auth.user.id,
          workspaceId: campaign.workspaceId,
        },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      await prisma.campaign.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ─── AUDIENCE PREVIEW ─────────────────────────────────
  previewAudience: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        audienceType: z.enum(AUDIENCE_TYPES).default("all"),
        audienceStage: z.string().optional(),
        audienceCategoryId: z.string().optional(),
        audienceInactiveDays: z.number().int().min(1).optional(),
        frequencyCapDays: z.number().int().min(1).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const member = await prisma.member.findFirst({
        where: {
          userId: ctx.auth.user.id,
          workspaceId: input.workspaceId,
        },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      const where = await buildAudienceWhere(
        input.workspaceId,
        input.audienceType,
        {
          audienceStage: input.audienceStage,
          audienceCategoryId: input.audienceCategoryId,
          audienceInactiveDays: input.audienceInactiveDays,
          frequencyCapDays: input.frequencyCapDays,
        },
      );

      const [count, sample] = await Promise.all([
        prisma.chatContact.count({ where }),
        prisma.chatContact.findMany({
          where,
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            stage: true,
          },
        }),
      ]);

      return { count, sample };
    }),

  // ─── LAUNCH ───────────────────────────────────────────
  launchCampaign: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await prisma.campaign.findUnique({
        where: { id: input.id },
        select: { workspaceId: true, status: true },
      });
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });

      if (!["draft", "scheduled"].includes(campaign.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Campaign has already been launched",
        });
      }

      const member = await prisma.member.findFirst({
        where: {
          userId: ctx.auth.user.id,
          workspaceId: campaign.workspaceId,
        },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      await prisma.campaign.update({
        where: { id: input.id },
        data: {
          status: "sending",
          startedAt: new Date(),
        },
      });

      // Trigger Inngest function
      const { sendCampaignSend } = await import("@/inngest/utils");
      await sendCampaignSend({ campaignId: input.id });

      return { success: true };
    }),

  // ─── PAUSE / RESUME ───────────────────────────────────
  pauseCampaign: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await prisma.campaign.findUnique({
        where: { id: input.id },
        select: { workspaceId: true, status: true },
      });
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });

      if (campaign.status !== "sending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only pause a sending campaign",
        });
      }

      const member = await prisma.member.findFirst({
        where: {
          userId: ctx.auth.user.id,
          workspaceId: campaign.workspaceId,
        },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      await prisma.campaign.update({
        where: { id: input.id },
        data: { status: "paused" },
      });

      return { success: true };
    }),

  resumeCampaign: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await prisma.campaign.findUnique({
        where: { id: input.id },
        select: { workspaceId: true, status: true },
      });
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });

      if (campaign.status !== "paused") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only resume a paused campaign",
        });
      }

      const member = await prisma.member.findFirst({
        where: {
          userId: ctx.auth.user.id,
          workspaceId: campaign.workspaceId,
        },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      await prisma.campaign.update({
        where: { id: input.id },
        data: { status: "sending" },
      });

      // Re-trigger Inngest to continue sending pending recipients
      const { sendCampaignSend } = await import("@/inngest/utils");
      await sendCampaignSend({ campaignId: input.id });

      return { success: true };
    }),

  // ─── RECIPIENTS ───────────────────────────────────────
  getRecipients: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        status: z.string().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const campaign = await prisma.campaign.findUnique({
        where: { id: input.campaignId },
        select: { workspaceId: true },
      });
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });

      const member = await prisma.member.findFirst({
        where: {
          userId: ctx.auth.user.id,
          workspaceId: campaign.workspaceId,
        },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      const where: any = { campaignId: input.campaignId };
      if (input.status) where.status = input.status;

      const [recipients, totalCount] = await Promise.all([
        prisma.campaignRecipient.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                stage: true,
              },
            },
          },
        }),
        prisma.campaignRecipient.count({ where }),
      ]);

      return {
        items: recipients,
        page: input.page,
        pageSize: input.pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / input.pageSize),
      };
    }),

  // ─── CANCEL ───────────────────────────────────────────
  cancelCampaign: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await prisma.campaign.findUnique({
        where: { id: input.id },
        select: { workspaceId: true, status: true },
      });
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });

      if (campaign.status === "completed" || campaign.status === "cancelled") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Campaign is already finished",
        });
      }

      const member = await prisma.member.findFirst({
        where: {
          userId: ctx.auth.user.id,
          workspaceId: campaign.workspaceId,
        },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      await prisma.$transaction([
        prisma.campaign.update({
          where: { id: input.id },
          data: { status: "cancelled" },
        }),
        // Mark pending recipients as cancelled
        prisma.campaignRecipient.updateMany({
          where: {
            campaignId: input.id,
            status: "pending",
          },
          data: { status: "failed", errorMessage: "Campaign cancelled" },
        }),
      ]);

      return { success: true };
    }),

  pauseCampaignGroup: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const group = await prisma.campaignGroup.findUnique({
        where: { id: input.id },
        select: { createdById: true },
      });
      if (!group) throw new TRPCError({ code: "NOT_FOUND" });
      if (group.createdById !== ctx.auth.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await prisma.campaign.updateMany({
        where: { groupId: input.id, status: "sending" },
        data: { status: "paused" },
      });

      return { success: true };
    }),

  cancelCampaignGroup: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const group = await prisma.campaignGroup.findUnique({
        where: { id: input.id },
        select: { createdById: true },
      });
      if (!group) throw new TRPCError({ code: "NOT_FOUND" });
      if (group.createdById !== ctx.auth.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const campaigns = await prisma.campaign.findMany({
        where: { groupId: input.id },
        select: { id: true, status: true },
      });
      const activeIds = campaigns
        .filter((c) => c.status !== "completed" && c.status !== "cancelled")
        .map((c) => c.id);
      if (activeIds.length === 0) return { success: true };

      await prisma.$transaction([
        prisma.campaign.updateMany({
          where: { id: { in: activeIds } },
          data: { status: "cancelled" },
        }),
        prisma.campaignRecipient.updateMany({
          where: { campaignId: { in: activeIds }, status: "pending" },
          data: { status: "failed", errorMessage: "Campaign cancelled" },
        }),
      ]);

      return { success: true };
    }),
});
