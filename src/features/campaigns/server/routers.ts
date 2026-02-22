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
        channel: z.enum(["sms", "email"]).optional(),
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
        if (input.channel) where.channel = input.channel;

        const [campaigns, totalCount] = await Promise.all([
          prisma.campaign.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
              workspace: { select: { id: true, name: true } },
              createdBy: { select: { id: true, name: true } },
              autoReply: { select: { enabled: true } },
              _count: { select: { links: true } },
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
      if (input.channel) campaignWhere.channel = input.channel;

      const groupWhere: any = {
        createdById: ctx.auth.user.id,
        campaigns: {
          some: {
            workspaceId: { in: workspaceIds },
            ...(input.channel ? { channel: input.channel } : {}),
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
            autoReply: { select: { enabled: true } },
            _count: { select: { links: true } },
          },
        }),
        prisma.campaignGroup.findMany({
          where: groupWhere,
          orderBy: { createdAt: "desc" },
          include: {
            campaigns: {
              where: {
                workspaceId: { in: workspaceIds },
                ...(input.channel ? { channel: input.channel } : {}),
              },
              include: {
                workspace: { select: { id: true, name: true } },
                createdBy: { select: { id: true, name: true } },
                autoReply: { select: { enabled: true } },
                _count: { select: { links: true } },
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
          autoReply: {
            select: {
              enabled: true,
              tone: true,
              context: true,
              maxReplies: true,
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

      // If this is a recurring campaign, fetch its child executions
      const childCampaigns = campaign.recurringType
        ? await prisma.campaign.findMany({
            where: { parentCampaignId: campaign.id },
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
              id: true,
              name: true,
              status: true,
              totalRecipients: true,
              sentCount: true,
              deliveredCount: true,
              repliedCount: true,
              createdAt: true,
              completedAt: true,
            },
          })
        : [];

      // Fetch auto-reply log count and recent logs
      const autoReplyStats = campaign.autoReply?.enabled
        ? await prisma.campaignAutoReplyLog.aggregate({
            where: { campaignId: campaign.id },
            _count: true,
          })
        : null;

      const recentAutoReplies = campaign.autoReply?.enabled
        ? await prisma.campaignAutoReplyLog.findMany({
            where: { campaignId: campaign.id },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              inboundMessage: true,
              aiResponse: true,
              tone: true,
              createdAt: true,
              recipient: {
                select: {
                  contact: {
                    select: {
                      firstName: true,
                      lastName: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          })
        : [];

      return {
        ...campaign,
        childCampaigns,
        autoReplyStats,
        recentAutoReplies,
      };
    }),

  // ─── CREATE ───────────────────────────────────────────
  createCampaign: protectedProcedure
    .input(
      z
        .object({
          workspaceId: z.string(),
          name: z.string().trim().min(1).max(100),
          channel: z.enum(["sms", "email"]).default("sms"),
          messageTemplate: z.string().trim().min(1).max(1600),
          subject: z.string().trim().max(200).optional(),
          templateId: z.string().optional(),
          segmentId: z.string().optional(),
          variantB: z.string().max(1600).optional(),
          variantSplit: z.number().int().min(10).max(90).optional(),
          recurringType: z.enum(["weekly", "monthly"]).optional(),
          recurringDay: z.number().int().min(0).max(28).optional(),
          recurringTime: z
            .string()
            .regex(/^\d{2}:\d{2}$/)
            .optional(),
          recurringEndAt: z.date().optional(),
          sendWindowStart: z
            .string()
            .regex(/^\d{2}:\d{2}$/)
            .optional(),
          sendWindowEnd: z
            .string()
            .regex(/^\d{2}:\d{2}$/)
            .optional(),
          audienceType: z.enum(AUDIENCE_TYPES).default("all"),
          audienceStage: z.string().optional(),
          audienceCategoryId: z.string().optional(),
          audienceInactiveDays: z.number().int().min(1).optional(),
          frequencyCapDays: z.number().int().min(1).optional(),
          unsubscribeLink: z.boolean().default(false),
          autoReplyEnabled: z.boolean().default(false),
          autoReplyTone: z
            .enum(["friendly", "professional", "casual"])
            .optional(),
          autoReplyContext: z.string().max(500).optional(),
          autoReplyMaxReplies: z.number().int().min(1).max(10).optional(),
          scheduledAt: z.string().datetime().optional(),
        })
        .refine(
          (data) => {
            if (!data.recurringType || data.recurringDay === undefined)
              return true;
            if (data.recurringType === "weekly")
              return data.recurringDay >= 0 && data.recurringDay <= 6;
            if (data.recurringType === "monthly")
              return data.recurringDay >= 1 && data.recurringDay <= 28;
            return true;
          },
          { message: "Invalid recurringDay for the selected frequency" },
        ),
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

      if (input.channel === "sms") {
        // Verify workspace has a Twilio number for SMS campaigns
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
      }

      const status = input.recurringType
        ? "scheduled"
        : input.scheduledAt
          ? "scheduled"
          : "draft";

      const campaign = await prisma.$transaction(async (tx) => {
        const createdCampaign = await tx.campaign.create({
          data: {
            workspaceId: input.workspaceId,
            createdById: ctx.auth.user.id,
            name: input.name,
            channel: input.channel,
            messageTemplate: input.messageTemplate,
            subject: input.subject || null,
            templateId: input.templateId || null,
            segmentId: input.segmentId || null,
            variantB: input.variantB || null,
            variantSplit: input.variantB ? (input.variantSplit ?? 50) : 50,
            recurringType: input.recurringType || null,
            recurringDay: input.recurringType ? (input.recurringDay ?? 1) : null,
            recurringTime: input.recurringType
              ? (input.recurringTime ?? "09:00")
              : null,
            recurringEndAt: input.recurringEndAt || null,
            sendWindowStart: input.sendWindowStart || null,
            sendWindowEnd: input.sendWindowEnd || null,
            audienceType: input.audienceType,
            audienceStage: input.audienceStage || null,
            audienceCategoryId: input.audienceCategoryId || null,
            audienceInactiveDays: input.audienceInactiveDays || null,
            frequencyCapDays: input.frequencyCapDays || null,
            unsubscribeLink: input.unsubscribeLink,
            scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
            status,
          },
        });

        if (input.autoReplyEnabled) {
          await tx.campaignAutoReply.create({
            data: {
              campaignId: createdCampaign.id,
              enabled: true,
              tone: input.autoReplyTone || "friendly",
              context: input.autoReplyContext || null,
              maxReplies: input.autoReplyMaxReplies || 1,
            },
          });
        }

        return createdCampaign;
      });

      return campaign;
    }),

  createCampaignGroup: protectedProcedure
    .input(
      z
        .object({
          name: z.string().trim().min(1).max(100),
          workspaceIds: z.array(z.string()).min(2),
          channel: z.enum(["sms", "email"]).default("sms"),
          messageTemplate: z.string().trim().min(1).max(1600),
          subject: z.string().trim().max(200).optional(),
          templateId: z.string().optional(),
          segmentId: z.string().optional(),
          variantB: z.string().max(1600).optional(),
          variantSplit: z.number().int().min(10).max(90).optional(),
          recurringType: z.enum(["weekly", "monthly"]).optional(),
          recurringDay: z.number().int().min(0).max(28).optional(),
          recurringTime: z
            .string()
            .regex(/^\d{2}:\d{2}$/)
            .optional(),
          recurringEndAt: z.date().optional(),
          sendWindowStart: z
            .string()
            .regex(/^\d{2}:\d{2}$/)
            .optional(),
          sendWindowEnd: z
            .string()
            .regex(/^\d{2}:\d{2}$/)
            .optional(),
          audienceType: z.enum(AUDIENCE_TYPES).default("all"),
          audienceStage: z.string().optional(),
          audienceCategoryId: z.string().optional(),
          audienceInactiveDays: z.number().int().min(1).optional(),
          frequencyCapDays: z.number().int().min(1).optional(),
          unsubscribeLink: z.boolean().default(false),
          autoReplyEnabled: z.boolean().default(false),
          autoReplyTone: z
            .enum(["friendly", "professional", "casual"])
            .optional(),
          autoReplyContext: z.string().max(500).optional(),
          autoReplyMaxReplies: z.number().int().min(1).max(10).optional(),
          scheduledAt: z.string().datetime().optional(),
        })
        .refine(
          (data) => {
            if (!data.recurringType || data.recurringDay === undefined)
              return true;
            if (data.recurringType === "weekly")
              return data.recurringDay >= 0 && data.recurringDay <= 6;
            if (data.recurringType === "monthly")
              return data.recurringDay >= 1 && data.recurringDay <= 28;
            return true;
          },
          { message: "Invalid recurringDay for the selected frequency" },
        ),
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

      if (input.channel === "sms") {
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
      }

      const status = input.recurringType
        ? "scheduled"
        : input.scheduledAt
          ? "scheduled"
          : "draft";
      return prisma.$transaction(async (tx) => {
        const group = await tx.campaignGroup.create({
          data: {
            createdById: ctx.auth.user.id,
            name: input.name,
          },
        });

        const createdCampaigns = await Promise.all(
          workspaceIds.map((workspaceId) =>
            tx.campaign.create({
              data: {
                groupId: group.id,
                workspaceId,
                createdById: ctx.auth.user.id,
                name: input.name,
                channel: input.channel,
                messageTemplate: input.messageTemplate,
                subject: input.subject || null,
                templateId: input.templateId || null,
                segmentId: input.segmentId || null,
                variantB: input.variantB || null,
                variantSplit: input.variantB ? (input.variantSplit ?? 50) : 50,
                recurringType: input.recurringType || null,
                recurringDay: input.recurringType
                  ? (input.recurringDay ?? 1)
                  : null,
                recurringTime: input.recurringType
                  ? (input.recurringTime ?? "09:00")
                  : null,
                recurringEndAt: input.recurringEndAt || null,
                sendWindowStart: input.sendWindowStart || null,
                sendWindowEnd: input.sendWindowEnd || null,
                audienceType: input.audienceType,
                audienceStage: input.audienceStage || null,
                audienceCategoryId: input.audienceCategoryId || null,
                audienceInactiveDays: input.audienceInactiveDays || null,
                frequencyCapDays: input.frequencyCapDays || null,
                unsubscribeLink: input.unsubscribeLink,
                scheduledAt: input.scheduledAt
                  ? new Date(input.scheduledAt)
                  : null,
                status,
              },
              select: { id: true },
            }),
          ),
        );

        if (input.autoReplyEnabled) {
          const campaignIds = createdCampaigns.map((c) => c.id);
          await tx.campaignAutoReply.createMany({
            data: campaignIds.map((cId) => ({
              campaignId: cId,
              enabled: true,
              tone: input.autoReplyTone || "friendly",
              context: input.autoReplyContext || null,
              maxReplies: input.autoReplyMaxReplies || 1,
            })),
          });
        }

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
          select: {
            id: true,
            campaignId: true,
            contactId: true,
            status: true,
            sentAt: true,
            deliveredAt: true,
            failedAt: true,
            repliedAt: true,
            errorMessage: true,
            smsMessageId: true,
            createdAt: true,
            variant: true,
            aiRepliesSent: true,
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
  cloneCampaign: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await prisma.campaign.findUnique({
        where: { id: input.id },
        select: {
          workspaceId: true,
          createdById: true,
          name: true,
          channel: true,
          messageTemplate: true,
          subject: true,
          audienceType: true,
          audienceStage: true,
          audienceCategoryId: true,
          audienceInactiveDays: true,
          frequencyCapDays: true,
          templateId: true,
          segmentId: true,
          variantB: true,
          variantSplit: true,
          sendWindowStart: true,
          sendWindowEnd: true,
          unsubscribeLink: true,
          autoReply: {
            select: {
              enabled: true,
              tone: true,
              context: true,
              maxReplies: true,
            },
          },
          workspace: { select: { members: { select: { userId: true } } } },
        },
      });

      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = campaign.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      const clone = await prisma.$transaction(async (tx) => {
        const createdCampaign = await tx.campaign.create({
          data: {
            workspaceId: campaign.workspaceId,
            createdById: ctx.auth.user.id,
            name: `${campaign.name} (copy)`,
            channel: campaign.channel,
            messageTemplate: campaign.messageTemplate,
            subject: campaign.subject,
            audienceType: campaign.audienceType,
            audienceStage: campaign.audienceStage,
            audienceCategoryId: campaign.audienceCategoryId,
            audienceInactiveDays: campaign.audienceInactiveDays,
            frequencyCapDays: campaign.frequencyCapDays,
            templateId: campaign.templateId,
            segmentId: campaign.segmentId,
            variantB: campaign.variantB,
            variantSplit: campaign.variantSplit,
            sendWindowStart: campaign.sendWindowStart,
            sendWindowEnd: campaign.sendWindowEnd,
            unsubscribeLink: campaign.unsubscribeLink,
            status: "draft",
          },
        });

        if (campaign.autoReply?.enabled) {
          await tx.campaignAutoReply.create({
            data: {
              campaignId: createdCampaign.id,
              enabled: true,
              tone: campaign.autoReply.tone,
              context: campaign.autoReply.context,
              maxReplies: campaign.autoReply.maxReplies,
            },
          });
        }

        return createdCampaign;
      });

      return clone;
    }),
  // ─── CROSS-LOCATION REPORTING ─────────────────────────
  getCrossLocationStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id;

    const workspaces = await prisma.member.findMany({
      where: { userId },
      select: { workspaceId: true },
    });

    const workspaceIds = workspaces.map((w) => w.workspaceId);

    if (workspaceIds.length === 0) return { locations: [], totals: null };

    // Single query — aggregate per workspace
    const locationStats = await prisma.campaign.groupBy({
      by: ["workspaceId"],
      where: {
        workspaceId: { in: workspaceIds },
        status: { in: ["completed", "sending"] },
      },
      _count: true,
      _sum: {
        totalRecipients: true,
        sentCount: true,
        deliveredCount: true,
        failedCount: true,
        repliedCount: true,
      },
    });

    // Workspace names + phone numbers
    const workspaceDetails = await prisma.workspace.findMany({
      where: { id: { in: workspaceIds } },
      select: {
        id: true,
        name: true,
        twilioPhoneNumber: { select: { phoneNumber: true } },
      },
    });

    const detailMap = new Map(workspaceDetails.map((w) => [w.id, w]));

    // Top template per location
    const topTemplates = await prisma.campaign.groupBy({
      by: ["workspaceId", "templateId"],
      where: {
        workspaceId: { in: workspaceIds },
        status: { in: ["completed", "sending"] },
        templateId: { not: null },
      },
      _sum: { repliedCount: true },
      orderBy: { _sum: { repliedCount: "desc" } },
    });

    // Get unique template IDs
    const templateIds = [
      ...new Set(
        topTemplates
          .filter((t) => t.templateId)
          .map((t) => t.templateId as string),
      ),
    ];

    const templateNames =
      templateIds.length > 0
        ? await prisma.campaignTemplate.findMany({
            where: { id: { in: templateIds } },
            select: { id: true, name: true },
          })
        : [];

    const templateNameMap = new Map(templateNames.map((t) => [t.id, t.name]));

    // Best template per workspace (first occurrence per workspaceId)
    const bestTemplatePerWorkspace = new Map<
      string,
      { id: string; name: string; replies: number }
    >();

    for (const t of topTemplates) {
      if (!bestTemplatePerWorkspace.has(t.workspaceId) && t.templateId) {
        bestTemplatePerWorkspace.set(t.workspaceId, {
          id: t.templateId,
          name: templateNameMap.get(t.templateId) || "Unknown",
          replies: t._sum.repliedCount || 0,
        });
      }
    }

    // Weekly trend per workspace (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const weeklyRaw = await prisma.campaign.findMany({
      where: {
        workspaceId: { in: workspaceIds },
        status: { in: ["completed", "sending"] },
        createdAt: { gte: fourWeeksAgo },
      },
      select: {
        workspaceId: true,
        createdAt: true,
        sentCount: true,
        repliedCount: true,
      },
    });

    // Bucket into weeks
    const weeklyByWorkspace = new Map<
      string,
      { week: number; sent: number; replied: number }[]
    >();

    for (const c of weeklyRaw) {
      const weeksAgo = Math.floor(
        (Date.now() - c.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000),
      );
      const weekIdx = Math.min(weeksAgo, 3); // 0=this week, 3=oldest

      if (!weeklyByWorkspace.has(c.workspaceId)) {
        weeklyByWorkspace.set(
          c.workspaceId,
          [0, 1, 2, 3].map((w) => ({ week: w, sent: 0, replied: 0 })),
        );
      }

      const weeks = weeklyByWorkspace.get(c.workspaceId)!;
      weeks[weekIdx].sent += c.sentCount;
      weeks[weekIdx].replied += c.repliedCount;
    }

    // Auto-reply stats per workspace
    const autoReplyStats = await prisma.campaignAutoReplyLog.groupBy({
      by: ["campaignId"],
      where: {
        campaign: { workspaceId: { in: workspaceIds } },
      },
      _count: true,
    });

    const autoReplyByCampaign = new Map(
      autoReplyStats.map((s) => [s.campaignId, s._count]),
    );

    // Map campaigns to workspaces for auto-reply rollup
    const campaignWorkspaceMap = await prisma.campaign.findMany({
      where: {
        id: { in: autoReplyStats.map((s) => s.campaignId) },
      },
      select: { id: true, workspaceId: true },
    });

    const aiRepliesByWorkspace = new Map<string, number>();
    for (const cw of campaignWorkspaceMap) {
      const count = autoReplyByCampaign.get(cw.id) || 0;
      aiRepliesByWorkspace.set(
        cw.workspaceId,
        (aiRepliesByWorkspace.get(cw.workspaceId) || 0) + count,
      );
    }

    // Link clicks per workspace
    const linkClickStats = await prisma.campaignLink.groupBy({
      by: ["campaignId"],
      where: {
        campaign: { workspaceId: { in: workspaceIds } },
      },
      _sum: { clickCount: true },
    });

    const clickCampaignIds = linkClickStats.map((s) => s.campaignId);
    const clickCampaignWorkspaces =
      clickCampaignIds.length > 0
        ? await prisma.campaign.findMany({
            where: { id: { in: clickCampaignIds } },
            select: { id: true, workspaceId: true },
          })
        : [];

    const clicksByWorkspace = new Map<string, number>();
    const cwMap = new Map(clickCampaignWorkspaces.map((c) => [c.id, c.workspaceId]));

    for (const s of linkClickStats) {
      const wsId = cwMap.get(s.campaignId);
      if (wsId) {
        clicksByWorkspace.set(
          wsId,
          (clicksByWorkspace.get(wsId) || 0) + (s._sum.clickCount || 0),
        );
      }
    }

    // Text-to-join signups per workspace
    const keywordStats = await prisma.textToJoinKeyword.groupBy({
      by: ["workspaceId"],
      where: { workspaceId: { in: workspaceIds } },
      _sum: { contactCount: true },
    });

    const signupsByWorkspace = new Map(
      keywordStats.map((k) => [k.workspaceId, k._sum.contactCount || 0]),
    );

    // Build response
    const locations = locationStats
      .map((ls) => {
        const detail = detailMap.get(ls.workspaceId);
        const sent = ls._sum.sentCount || 0;
        const delivered = ls._sum.deliveredCount || 0;
        const replied = ls._sum.repliedCount || 0;
        const failed = ls._sum.failedCount || 0;

        return {
          workspaceId: ls.workspaceId,
          name: detail?.name || "Unknown",
          phone: detail?.twilioPhoneNumber?.phoneNumber || null,
          campaignCount: ls._count,
          totalRecipients: ls._sum.totalRecipients || 0,
          sent,
          delivered,
          failed,
          replied,
          deliveryRate: sent > 0 ? delivered / sent : 0,
          replyRate: sent > 0 ? replied / sent : 0,
          topTemplate: bestTemplatePerWorkspace.get(ls.workspaceId) || null,
          weeklyTrend:
            weeklyByWorkspace.get(ls.workspaceId) ||
            [0, 1, 2, 3].map((w) => ({ week: w, sent: 0, replied: 0 })),
          aiReplies: aiRepliesByWorkspace.get(ls.workspaceId) || 0,
          linkClicks: clicksByWorkspace.get(ls.workspaceId) || 0,
          keywordSignups: signupsByWorkspace.get(ls.workspaceId) || 0,
        };
      })
      .sort((a, b) => b.replyRate - a.replyRate);

    // Totals
    const totals = locations.reduce(
      (acc, l) => {
        acc.campaigns += l.campaignCount;
        acc.recipients += l.totalRecipients;
        acc.sent += l.sent;
        acc.delivered += l.delivered;
        acc.failed += l.failed;
        acc.replied += l.replied;
        acc.aiReplies += l.aiReplies;
        acc.linkClicks += l.linkClicks;
        acc.keywordSignups += l.keywordSignups;
        return acc;
      },
      {
        locations: locations.length,
        campaigns: 0,
        recipients: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        replied: 0,
        aiReplies: 0,
        linkClicks: 0,
        keywordSignups: 0,
      },
    );

    return { locations, totals };
  }),
});
