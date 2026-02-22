import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

const WEBHOOK_EVENTS = [
  {
    value: "campaign.sent",
    label: "Campaign Sent",
    description: "When a campaign starts sending",
  },
  {
    value: "campaign.completed",
    label: "Campaign Completed",
    description: "When all messages have been sent",
  },
  {
    value: "contact.replied",
    label: "Contact Replied",
    description: "When a contact replies to a campaign",
  },
  {
    value: "contact.clicked",
    label: "Link Clicked",
    description: "When a contact clicks a tracked link",
  },
  {
    value: "contact.opted_out",
    label: "Contact Opted Out",
    description: "When a contact unsubscribes",
  },
  {
    value: "contact.created",
    label: "Contact Created",
    description: "When a new contact is added",
  },
  {
    value: "keyword.joined",
    label: "Keyword Joined",
    description: "When someone texts a keyword to join",
  },
  {
    value: "email.opened",
    label: "Email Opened",
    description: "When a contact opens an email",
  },
  {
    value: "email.bounced",
    label: "Email Bounced",
    description: "When an email bounces",
  },
] as const;

type WebhookEventValue = (typeof WEBHOOK_EVENTS)[number]["value"];
const eventValues = WEBHOOK_EVENTS.map((e) => e.value) as [
  WebhookEventValue,
  ...WebhookEventValue[],
];

export { WEBHOOK_EVENTS };

export const webhookRouter = createTRPCRouter({
  // ─── LIST ─────────────────────────────────────────────
  getEndpoints: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const membership = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.workspaceId,
          },
        },
      });
      if (!membership) throw new TRPCError({ code: "FORBIDDEN" });

      return prisma.webhookEndpoint.findMany({
        where: { workspaceId: input.workspaceId },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { deliveries: true } },
        },
      });
    }),

  // ─── CREATE ───────────────────────────────────────────
  createEndpoint: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        url: z.string().url().max(500),
        events: z.array(z.enum(eventValues)).min(1),
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

      const count = await prisma.webhookEndpoint.count({
        where: { workspaceId: input.workspaceId },
      });
      if (count >= 5) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum 5 webhook endpoints per location",
        });
      }

      const secret = `whsec_${randomBytes(24).toString("hex")}`;

      return prisma.webhookEndpoint.create({
        data: {
          workspaceId: input.workspaceId,
          url: input.url,
          events: input.events,
          secret,
          active: true,
        },
      });
    }),

  // ─── UPDATE ───────────────────────────────────────────
  updateEndpoint: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        url: z.string().url().max(500).optional(),
        events: z.array(z.enum(eventValues)).min(1).optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const endpoint = await prisma.webhookEndpoint.findUnique({
        where: { id: input.id },
        select: {
          workspaceId: true,
          workspace: { select: { members: { select: { userId: true } } } },
        },
      });

      if (!endpoint) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = endpoint.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      const { id, ...data } = input;

      if (data.active === true) {
        return prisma.webhookEndpoint.update({
          where: { id },
          data: { ...data, failCount: 0, lastError: null },
        });
      }

      return prisma.webhookEndpoint.update({ where: { id }, data });
    }),

  // ─── DELETE ───────────────────────────────────────────
  deleteEndpoint: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const endpoint = await prisma.webhookEndpoint.findUnique({
        where: { id: input.id },
        select: {
          workspace: { select: { members: { select: { userId: true } } } },
        },
      });

      if (!endpoint) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = endpoint.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      await prisma.webhookEndpoint.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ─── ROTATE SECRET ────────────────────────────────────
  rotateSecret: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const endpoint = await prisma.webhookEndpoint.findUnique({
        where: { id: input.id },
        select: {
          workspace: { select: { members: { select: { userId: true } } } },
        },
      });

      if (!endpoint) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = endpoint.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      const secret = `whsec_${randomBytes(24).toString("hex")}`;

      return prisma.webhookEndpoint.update({
        where: { id: input.id },
        data: { secret },
        select: { id: true, secret: true },
      });
    }),

  // ─── DELIVERY LOG ─────────────────────────────────────
  getDeliveries: protectedProcedure
    .input(
      z.object({
        endpointId: z.string(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const endpoint = await prisma.webhookEndpoint.findUnique({
        where: { id: input.endpointId },
        select: {
          workspace: { select: { members: { select: { userId: true } } } },
        },
      });

      if (!endpoint) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = endpoint.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      const skip = (input.page - 1) * input.limit;

      const [deliveries, total] = await Promise.all([
        prisma.webhookDelivery.findMany({
          where: { endpointId: input.endpointId },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.limit,
          select: {
            id: true,
            event: true,
            status: true,
            duration: true,
            error: true,
            attemptCount: true,
            createdAt: true,
          },
        }),
        prisma.webhookDelivery.count({
          where: { endpointId: input.endpointId },
        }),
      ]);

      return { deliveries, total, page: input.page, limit: input.limit };
    }),

  // ─── AVAILABLE EVENTS ─────────────────────────────────
  getAvailableEvents: protectedProcedure.query(() => WEBHOOK_EVENTS),
});
