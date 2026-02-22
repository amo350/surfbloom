import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { enrollContacts as enrollContactsBatch } from "./enroll";

const TRIGGER_TYPES = [
  {
    value: "manual",
    label: "Manual",
    description: "Enroll contacts manually or via bulk action",
  },
  {
    value: "contact_created",
    label: "New Contact",
    description: "Auto-enroll when a contact is created",
  },
  {
    value: "keyword_join",
    label: "Keyword Join",
    description: "Auto-enroll when someone texts a keyword",
  },
  {
    value: "stage_change",
    label: "Stage Change",
    description: "Auto-enroll when contact enters a stage",
  },
] as const;

const CONDITION_TYPES = [
  {
    value: "replied",
    label: "Replied",
    description: "Contact replied to any previous step",
  },
  {
    value: "clicked",
    label: "Clicked Link",
    description: "Contact clicked a tracked link",
  },
  {
    value: "no_reply",
    label: "No Reply",
    description: "Contact hasn't replied yet",
  },
  {
    value: "opted_out",
    label: "Opted Out",
    description: "Contact unsubscribed",
  },
] as const;

export { TRIGGER_TYPES, CONDITION_TYPES };

export const sequenceRouter = createTRPCRouter({
  getSequences: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().optional(),
        status: z.enum(["draft", "active", "paused", "archived"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let workspaceIds: string[];

      if (input.workspaceId) {
        const membership = await prisma.member.findUnique({
          where: {
            userId_workspaceId: {
              userId: ctx.auth.user.id,
              workspaceId: input.workspaceId,
            },
          },
        });
        if (!membership) throw new TRPCError({ code: "FORBIDDEN" });
        workspaceIds = [input.workspaceId];
      } else {
        const memberships = await prisma.member.findMany({
          where: { userId: ctx.auth.user.id },
          select: { workspaceId: true },
        });
        workspaceIds = memberships.map((m) => m.workspaceId);
      }

      const where: any = { workspaceId: { in: workspaceIds } };
      if (input.status) where.status = input.status;

      return prisma.campaignSequence.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          workspace: { select: { id: true, name: true } },
          _count: {
            select: {
              steps: true,
              enrollments: true,
            },
          },
        },
      });
    }),

  getSequence: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const sequence = await prisma.campaignSequence.findUnique({
        where: { id: input.id },
        include: {
          workspace: {
            select: {
              name: true,
              members: { select: { userId: true } },
              twilioPhoneNumber: { select: { phoneNumber: true } },
              fromEmail: true,
              fromEmailName: true,
            },
          },
          steps: {
            orderBy: { order: "asc" },
            include: {
              _count: { select: { stepLogs: true } },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      });

      if (!sequence) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = sequence.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      const enrollmentStats = await prisma.campaignSequenceEnrollment.groupBy({
        by: ["status"],
        where: { sequenceId: input.id },
        _count: true,
      });

      const statusMap = new Map(
        enrollmentStats.map((s) => [s.status, s._count]),
      );

      return {
        ...sequence,
        enrollmentStats: {
          active: statusMap.get("active") || 0,
          completed: statusMap.get("completed") || 0,
          stopped: statusMap.get("stopped") || 0,
          optedOut: statusMap.get("opted_out") || 0,
          total: sequence._count.enrollments,
        },
      };
    }),

  getStepStats: protectedProcedure
    .input(z.object({ sequenceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const sequence = await prisma.campaignSequence.findUnique({
        where: { id: input.sequenceId },
        select: {
          workspace: { select: { members: { select: { userId: true } } } },
          steps: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              order: true,
              channel: true,
              subject: true,
              body: true,
            },
          },
        },
      });

      if (!sequence) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = sequence.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      const stepStats = await Promise.all(
        sequence.steps.map(async (step) => {
          const logs = await prisma.campaignSequenceStepLog.groupBy({
            by: ["status"],
            where: { stepId: step.id },
            _count: true,
          });

          const statusMap = new Map(logs.map((l) => [l.status, l._count]));

          return {
            stepId: step.id,
            order: step.order,
            channel: step.channel,
            subject: step.subject,
            bodyPreview: step.body.replace(/<[^>]+>/g, " ").trim().slice(0, 80),
            sent: statusMap.get("sent") || 0,
            delivered: statusMap.get("delivered") || 0,
            failed: statusMap.get("failed") || 0,
            skipped: statusMap.get("skipped") || 0,
            total:
              (statusMap.get("sent") || 0) +
              (statusMap.get("delivered") || 0) +
              (statusMap.get("failed") || 0) +
              (statusMap.get("skipped") || 0),
          };
        }),
      );

      return stepStats;
    }),

  createSequence: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        name: z.string().trim().min(1).max(100),
        description: z.string().max(500).optional(),
        audienceType: z
          .enum(["all", "stage", "category", "inactive"])
          .default("all"),
        audienceStage: z.string().optional(),
        audienceCategoryId: z.string().optional(),
        audienceInactiveDays: z.number().int().min(7).max(365).optional(),
        frequencyCapDays: z.number().int().min(1).max(365).optional(),
        triggerType: z
          .enum(["manual", "contact_created", "keyword_join", "stage_change"])
          .default("manual"),
        triggerValue: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const membership = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.workspaceId,
          },
        },
      });
      if (!membership) throw new TRPCError({ code: "FORBIDDEN" });

      if (input.triggerType === "keyword_join" && !input.triggerValue) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select a keyword for the keyword join trigger",
        });
      }
      if (input.triggerType === "stage_change" && !input.triggerValue) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select a stage for the stage change trigger",
        });
      }

      return prisma.campaignSequence.create({
        data: {
          workspaceId: input.workspaceId,
          createdById: ctx.auth.user.id,
          name: input.name,
          description: input.description || null,
          status: "draft",
          audienceType: input.audienceType,
          audienceStage: input.audienceStage || null,
          audienceCategoryId: input.audienceCategoryId || null,
          audienceInactiveDays: input.audienceInactiveDays || null,
          frequencyCapDays: input.frequencyCapDays || null,
          triggerType: input.triggerType,
          triggerValue: input.triggerValue || null,
        },
      });
    }),

  updateSequence: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1).max(100).optional(),
        description: z.string().max(500).nullable().optional(),
        audienceType: z
          .enum(["all", "stage", "category", "inactive"])
          .optional(),
        audienceStage: z.string().nullable().optional(),
        audienceCategoryId: z.string().nullable().optional(),
        audienceInactiveDays: z
          .number()
          .int()
          .min(7)
          .max(365)
          .nullable()
          .optional(),
        frequencyCapDays: z
          .number()
          .int()
          .min(1)
          .max(365)
          .nullable()
          .optional(),
        triggerType: z
          .enum(["manual", "contact_created", "keyword_join", "stage_change"])
          .optional(),
        triggerValue: z.string().nullable().optional(),
        status: z.enum(["draft", "active", "paused", "archived"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sequence = await prisma.campaignSequence.findUnique({
        where: { id: input.id },
        select: {
          status: true,
          workspace: { select: { members: { select: { userId: true } } } },
          _count: { select: { steps: true } },
        },
      });

      if (!sequence) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = sequence.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      if (input.status === "active" && sequence._count.steps === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Add at least one step before activating",
        });
      }

      if (
        sequence.status === "active" &&
        (input.audienceType ||
          input.triggerType ||
          input.triggerValue !== undefined)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Pause the sequence before changing audience or trigger settings",
        });
      }

      const { id, ...data } = input;
      return prisma.campaignSequence.update({ where: { id }, data });
    }),

  deleteSequence: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sequence = await prisma.campaignSequence.findUnique({
        where: { id: input.id },
        select: {
          status: true,
          workspace: { select: { members: { select: { userId: true } } } },
        },
      });

      if (!sequence) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = sequence.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      if (sequence.status === "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Pause or archive the sequence before deleting",
        });
      }

      await prisma.campaignSequence.delete({ where: { id: input.id } });
      return { success: true };
    }),

  addStep: protectedProcedure
    .input(
      z.object({
        sequenceId: z.string(),
        channel: z.enum(["sms", "email"]).default("sms"),
        subject: z.string().max(200).optional(),
        body: z.string().trim().min(1).max(5000),
        templateId: z.string().optional(),
        delayMinutes: z.number().int().min(0).max(525600).default(1440),
        conditionType: z
          .enum(["none", "replied", "clicked", "no_reply", "opted_out"])
          .default("none"),
        conditionAction: z
          .enum(["continue", "skip", "stop"])
          .default("continue"),
        sendWindowStart: z.string().optional(),
        sendWindowEnd: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sequence = await prisma.campaignSequence.findUnique({
        where: { id: input.sequenceId },
        select: {
          status: true,
          workspace: { select: { members: { select: { userId: true } } } },
          _count: { select: { steps: true } },
        },
      });

      if (!sequence) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = sequence.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      if (sequence.status === "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Pause the sequence before adding steps",
        });
      }

      if (sequence._count.steps >= 20) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum 20 steps per sequence",
        });
      }

      if (input.channel === "email" && !input.subject) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email steps require a subject line",
        });
      }

      const nextOrder = sequence._count.steps + 1;

      return prisma.campaignSequenceStep.create({
        data: {
          sequenceId: input.sequenceId,
          order: nextOrder,
          channel: input.channel,
          subject: input.channel === "email" ? input.subject || null : null,
          body: input.body,
          templateId: input.templateId || null,
          delayMinutes: input.delayMinutes,
          conditionType:
            input.conditionType === "none" ? null : input.conditionType,
          conditionAction: input.conditionAction,
          sendWindowStart: input.sendWindowStart || null,
          sendWindowEnd: input.sendWindowEnd || null,
        },
      });
    }),

  updateStep: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        channel: z.enum(["sms", "email"]).optional(),
        subject: z.string().max(200).nullable().optional(),
        body: z.string().trim().min(1).max(5000).optional(),
        templateId: z.string().nullable().optional(),
        delayMinutes: z.number().int().min(0).max(525600).optional(),
        conditionType: z
          .enum(["none", "replied", "clicked", "no_reply", "opted_out"])
          .nullable()
          .optional(),
        conditionAction: z.enum(["continue", "skip", "stop"]).optional(),
        sendWindowStart: z.string().nullable().optional(),
        sendWindowEnd: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const step = await prisma.campaignSequenceStep.findUnique({
        where: { id: input.id },
        select: {
          sequence: {
            select: {
              status: true,
              workspace: { select: { members: { select: { userId: true } } } },
            },
          },
        },
      });

      if (!step) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = step.sequence.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      if (step.sequence.status === "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Pause the sequence before editing steps",
        });
      }

      const { id, ...data } = input;
      if (data.conditionType === "none") {
        data.conditionType = null;
      }
      return prisma.campaignSequenceStep.update({ where: { id }, data });
    }),

  deleteStep: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const step = await prisma.campaignSequenceStep.findUnique({
        where: { id: input.id },
        select: {
          sequenceId: true,
          order: true,
          sequence: {
            select: {
              status: true,
              workspace: { select: { members: { select: { userId: true } } } },
            },
          },
        },
      });

      if (!step) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = step.sequence.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      if (step.sequence.status === "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Pause the sequence before deleting steps",
        });
      }

      await prisma.$transaction([
        prisma.campaignSequenceStep.delete({ where: { id: input.id } }),
        prisma.campaignSequenceStep.updateMany({
          where: {
            sequenceId: step.sequenceId,
            order: { gt: step.order },
          },
          data: { order: { decrement: 1 } },
        }),
      ]);

      return { success: true };
    }),

  reorderSteps: protectedProcedure
    .input(
      z.object({
        sequenceId: z.string(),
        stepIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sequence = await prisma.campaignSequence.findUnique({
        where: { id: input.sequenceId },
        select: {
          status: true,
          workspace: { select: { members: { select: { userId: true } } } },
        },
      });

      if (!sequence) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = sequence.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      if (sequence.status === "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Pause the sequence before reordering steps",
        });
      }

      await prisma.$transaction(
        input.stepIds.map((id, index) =>
          prisma.campaignSequenceStep.update({
            where: { id },
            data: { order: index + 1 },
          }),
        ),
      );

      return { success: true };
    }),

  enrollContacts: protectedProcedure
    .input(
      z.object({
        sequenceId: z.string(),
        contactIds: z.array(z.string()).min(1).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sequence = await prisma.campaignSequence.findUnique({
        where: { id: input.sequenceId },
        select: {
          status: true,
          workspace: { select: { members: { select: { userId: true } } } },
        },
      });

      if (!sequence) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = sequence.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      if (sequence.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sequence must be active to enroll contacts",
        });
      }

      const result = await enrollContactsBatch(
        input.sequenceId,
        input.contactIds,
      );

      return {
        enrolled: result.enrolled,
        skipped: result.skipped,
      };
    }),

  getEnrollments: protectedProcedure
    .input(
      z.object({
        sequenceId: z.string(),
        status: z
          .enum(["active", "completed", "stopped", "opted_out"])
          .optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const sequence = await prisma.campaignSequence.findUnique({
        where: { id: input.sequenceId },
        select: {
          workspace: { select: { members: { select: { userId: true } } } },
        },
      });

      if (!sequence) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = sequence.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      const where: any = { sequenceId: input.sequenceId };
      if (input.status) where.status = input.status;
      const skip = (input.page - 1) * input.limit;

      const [enrollments, total] = await Promise.all([
        prisma.campaignSequenceEnrollment.findMany({
          where,
          orderBy: { enrolledAt: "desc" },
          skip,
          take: input.limit,
          select: {
            id: true,
            status: true,
            currentStep: true,
            nextStepAt: true,
            enrolledAt: true,
            completedAt: true,
            stoppedAt: true,
            stoppedReason: true,
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        }),
        prisma.campaignSequenceEnrollment.count({ where }),
      ]);

      return { enrollments, total, page: input.page, limit: input.limit };
    }),

  getContactEnrollments: protectedProcedure
    .input(z.object({ contactId: z.string() }))
    .query(async ({ ctx, input }) => {
      const contact = await prisma.chatContact.findUnique({
        where: { id: input.contactId },
        select: {
          workspace: { select: { members: { select: { userId: true } } } },
        },
      });

      if (!contact) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = contact.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      return prisma.campaignSequenceEnrollment.findMany({
        where: { contactId: input.contactId },
        orderBy: { enrolledAt: "desc" },
        take: 20,
        select: {
          id: true,
          status: true,
          currentStep: true,
          nextStepAt: true,
          enrolledAt: true,
          completedAt: true,
          stoppedAt: true,
          stoppedReason: true,
          sequence: {
            select: {
              id: true,
              name: true,
              _count: { select: { steps: true } },
            },
          },
        },
      });
    }),

  stopEnrollment: protectedProcedure
    .input(
      z.object({
        enrollmentId: z.string(),
        reason: z.string().max(200).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const enrollment = await prisma.campaignSequenceEnrollment.findUnique({
        where: { id: input.enrollmentId },
        select: {
          status: true,
          sequence: {
            select: {
              workspace: { select: { members: { select: { userId: true } } } },
            },
          },
        },
      });

      if (!enrollment) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = enrollment.sequence.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      if (enrollment.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only active enrollments can be stopped",
        });
      }

      return prisma.campaignSequenceEnrollment.update({
        where: { id: input.enrollmentId },
        data: {
          status: "stopped",
          stoppedAt: new Date(),
          stoppedReason: input.reason || "manual",
          nextStepAt: null,
        },
      });
    }),

  enrollByAudience: protectedProcedure
    .input(z.object({ sequenceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sequence = await prisma.campaignSequence.findUnique({
        where: { id: input.sequenceId },
        include: {
          workspace: {
            select: {
              id: true,
              members: { select: { userId: true } },
            },
          },
          _count: { select: { steps: true } },
        },
      });

      if (!sequence) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = sequence.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      if (sequence.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sequence must be active to enroll contacts",
        });
      }

      if (sequence._count.steps === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sequence has no steps",
        });
      }

      const audienceWhere: any = {
        workspaceId: sequence.workspace.id,
        isContact: true,
        optedOut: false,
      };

      if (sequence.audienceType === "stage" && sequence.audienceStage) {
        audienceWhere.stage = sequence.audienceStage;
      } else if (
        sequence.audienceType === "category" &&
        sequence.audienceCategoryId
      ) {
        audienceWhere.categories = {
          some: { categoryId: sequence.audienceCategoryId },
        };
      } else if (
        sequence.audienceType === "inactive" &&
        sequence.audienceInactiveDays
      ) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - sequence.audienceInactiveDays);
        audienceWhere.OR = [
          { lastContactedAt: { lt: cutoff } },
          { lastContactedAt: null },
        ];
      }

      if (sequence.frequencyCapDays) {
        const capCutoff = new Date();
        capCutoff.setDate(capCutoff.getDate() - sequence.frequencyCapDays);
        const recentlyMessaged = await prisma.campaignRecipient.findMany({
          where: {
            contact: { workspaceId: sequence.workspace.id },
            sentAt: { gte: capCutoff },
            status: { in: ["sent", "delivered", "replied"] },
          },
          select: { contactId: true },
          distinct: ["contactId"],
        });
        if (recentlyMessaged.length > 0) {
          audienceWhere.id = {
            ...audienceWhere.id,
            notIn: recentlyMessaged.map((r) => r.contactId),
          };
        }
      }

      const contacts = await prisma.chatContact.findMany({
        where: audienceWhere,
        select: { id: true },
      });

      if (contacts.length === 0) {
        return { enrolled: 0, skipped: 0 };
      }

      const result = await enrollContactsBatch(
        input.sequenceId,
        contacts.map((c) => c.id),
      );

      return {
        enrolled: result.enrolled,
        skipped: result.skipped,
      };
    }),
});
