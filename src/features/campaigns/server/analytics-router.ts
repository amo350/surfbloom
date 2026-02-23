import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

type ChannelFilter = "all" | "sms" | "email";

const baseInput = z.object({
  workspaceId: z.string().optional(),
  days: z.number().int().min(7).max(90).default(30),
  channel: z.enum(["all", "sms", "email"]).default("all"),
});

const topCampaignSortInput = z.enum([
  "sent",
  "delivered",
  "replied",
  "reply_rate",
]);

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function trend(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

async function resolveWorkspaceIds(userId: string, workspaceId?: string) {
  if (workspaceId) {
    const membership = await prisma.member.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
      select: { workspaceId: true },
    });

    if (!membership) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return [workspaceId];
  }

  const memberships = await prisma.member.findMany({
    where: { userId },
    select: { workspaceId: true },
  });

  return memberships.map((m) => m.workspaceId);
}

async function aggregateCampaignCounts(params: {
  workspaceIds: string[];
  channel: ChannelFilter;
  start: Date;
  end: Date;
}) {
  if (params.workspaceIds.length === 0) {
    return { sent: 0, delivered: 0, failed: 0, replied: 0 };
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      workspaceId: { in: params.workspaceIds },
      createdAt: {
        gte: params.start,
        lt: params.end,
      },
      ...(params.channel !== "all" ? { channel: params.channel } : {}),
      status: { in: ["sending", "completed", "cancelled", "paused"] },
    },
    select: {
      sentCount: true,
      deliveredCount: true,
      failedCount: true,
      repliedCount: true,
    },
  });

  return campaigns.reduce(
    (acc, c) => ({
      sent: acc.sent + c.sentCount,
      delivered: acc.delivered + c.deliveredCount,
      failed: acc.failed + c.failedCount,
      replied: acc.replied + c.repliedCount,
    }),
    { sent: 0, delivered: 0, failed: 0, replied: 0 },
  );
}

export const analyticsRouter = createTRPCRouter({
  getOverviewStats: protectedProcedure
    .input(baseInput)
    .query(async ({ ctx, input }) => {
      const workspaceIds = await resolveWorkspaceIds(
        ctx.auth.user.id,
        input.workspaceId,
      );

      const currentStart = startOfDay(new Date());
      currentStart.setUTCDate(currentStart.getUTCDate() - input.days);

      const previousStart = new Date(currentStart);
      previousStart.setUTCDate(previousStart.getUTCDate() - input.days);

      const now = new Date();

      const [current, previous] = await Promise.all([
        aggregateCampaignCounts({
          workspaceIds,
          channel: input.channel,
          start: currentStart,
          end: now,
        }),
        aggregateCampaignCounts({
          workspaceIds,
          channel: input.channel,
          start: previousStart,
          end: currentStart,
        }),
      ]);

      const currentDeliveryRate =
        current.sent > 0 ? (current.delivered / current.sent) * 100 : 0;
      const previousDeliveryRate =
        previous.sent > 0 ? (previous.delivered / previous.sent) * 100 : 0;

      const currentReplyRate =
        current.sent > 0 ? (current.replied / current.sent) * 100 : 0;
      const previousReplyRate =
        previous.sent > 0 ? (previous.replied / previous.sent) * 100 : 0;

      return {
        sent: current.sent,
        delivered: current.delivered,
        failed: current.failed,
        replied: current.replied,
        deliveryRate: currentDeliveryRate,
        replyRate: currentReplyRate,
        sentTrend: trend(current.sent, previous.sent),
        deliveredTrend: trend(current.delivered, previous.delivered),
        repliedTrend: trend(current.replied, previous.replied),
        deliveryRateTrend: trend(currentDeliveryRate, previousDeliveryRate),
        replyRateTrend: trend(currentReplyRate, previousReplyRate),
      };
    }),

  getCampaignTimeSeries: protectedProcedure
    .input(baseInput)
    .query(async ({ ctx, input }) => {
      const workspaceIds = await resolveWorkspaceIds(
        ctx.auth.user.id,
        input.workspaceId,
      );
      const since = startOfDay(new Date());
      since.setUTCDate(since.getUTCDate() - input.days);
      const until = new Date();

      const recipients = await prisma.campaignRecipient.findMany({
        where: {
          campaign: {
            workspaceId: { in: workspaceIds },
            ...(input.channel !== "all" ? { channel: input.channel } : {}),
          },
          OR: [
            { sentAt: { gte: since, lte: until } },
            { deliveredAt: { gte: since, lte: until } },
            { failedAt: { gte: since, lte: until } },
            { repliedAt: { gte: since, lte: until } },
          ],
        },
        select: {
          sentAt: true,
          deliveredAt: true,
          failedAt: true,
          repliedAt: true,
        },
      });

      const bucketMap = new Map<
        string,
        {
          date: string;
          sent: number;
          delivered: number;
          failed: number;
          replied: number;
        }
      >();

      const ensureBucket = (dateKey: string) => {
        if (!bucketMap.has(dateKey)) {
          bucketMap.set(dateKey, {
            date: dateKey,
            sent: 0,
            delivered: 0,
            failed: 0,
            replied: 0,
          });
        }
        return bucketMap.get(dateKey)!;
      };

      for (const r of recipients) {
        if (r.sentAt) ensureBucket(toDateKey(r.sentAt)).sent += 1;
        if (r.deliveredAt)
          ensureBucket(toDateKey(r.deliveredAt)).delivered += 1;
        if (r.failedAt) ensureBucket(toDateKey(r.failedAt)).failed += 1;
        if (r.repliedAt) ensureBucket(toDateKey(r.repliedAt)).replied += 1;
      }

      const result: Array<{
        date: string;
        sent: number;
        delivered: number;
        failed: number;
        replied: number;
      }> = [];

      const cursor = new Date(since);
      while (cursor <= until) {
        const date = toDateKey(cursor);
        result.push(
          bucketMap.get(date) || {
            date,
            sent: 0,
            delivered: 0,
            failed: 0,
            replied: 0,
          },
        );
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }

      return result;
    }),

  getChannelBreakdown: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().optional(),
        days: z.number().int().min(7).max(90).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const workspaceIds = await resolveWorkspaceIds(
        ctx.auth.user.id,
        input.workspaceId,
      );
      const since = startOfDay(new Date());
      since.setUTCDate(since.getUTCDate() - input.days);

      const campaigns = await prisma.campaign.findMany({
        where: {
          workspaceId: { in: workspaceIds },
          createdAt: { gte: since },
          status: { in: ["sending", "completed", "cancelled", "paused"] },
        },
        select: {
          channel: true,
          sentCount: true,
          deliveredCount: true,
          failedCount: true,
          repliedCount: true,
        },
      });

      const seed = {
        campaigns: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        replied: 0,
      };

      const sms = { ...seed };
      const email = { ...seed };

      for (const c of campaigns) {
        const target = c.channel === "email" ? email : sms;
        target.campaigns += 1;
        target.sent += c.sentCount;
        target.delivered += c.deliveredCount;
        target.failed += c.failedCount;
        target.replied += c.repliedCount;
      }

      return { sms, email };
    }),

  getDeliveryFunnel: protectedProcedure
    .input(baseInput)
    .query(async ({ ctx, input }) => {
      const workspaceIds = await resolveWorkspaceIds(
        ctx.auth.user.id,
        input.workspaceId,
      );
      const since = startOfDay(new Date());
      since.setUTCDate(since.getUTCDate() - input.days);

      const campaigns = await prisma.campaign.findMany({
        where: {
          workspaceId: { in: workspaceIds },
          createdAt: { gte: since },
          ...(input.channel !== "all" ? { channel: input.channel } : {}),
          status: { in: ["sending", "completed", "cancelled", "paused"] },
        },
        select: {
          id: true,
          sentCount: true,
          deliveredCount: true,
          repliedCount: true,
        },
      });

      const campaignIds = campaigns.map((c) => c.id);
      const sent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
      const delivered = campaigns.reduce((sum, c) => sum + c.deliveredCount, 0);
      const replied = campaigns.reduce((sum, c) => sum + c.repliedCount, 0);

      let opened = 0;
      let clicked = 0;
      if (
        campaignIds.length > 0 &&
        (input.channel === "all" || input.channel === "email")
      ) {
        const emailEvents = await prisma.emailSend.findMany({
          where: {
            campaignId: { in: campaignIds },
            sentAt: { gte: since },
          },
          select: {
            status: true,
            openCount: true,
            clickCount: true,
          },
        });

        opened = emailEvents.reduce(
          (sum, row) =>
            sum +
            (row.openCount > 0
              ? row.openCount
              : row.status === "opened" || row.status === "clicked"
                ? 1
                : 0),
          0,
        );
        clicked = emailEvents.reduce(
          (sum, row) =>
            sum +
            (row.clickCount > 0
              ? row.clickCount
              : row.status === "clicked"
                ? 1
                : 0),
          0,
        );
      }

      return {
        sent,
        delivered,
        opened,
        clicked,
        replied,
      };
    }),

  getTopCampaigns: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().optional(),
        days: z.number().int().min(7).max(90).default(30),
        channel: z.enum(["all", "sms", "email"]).default("all"),
        sortBy: topCampaignSortInput.default("sent"),
        limit: z.number().int().min(5).max(25).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const workspaceIds = await resolveWorkspaceIds(
        ctx.auth.user.id,
        input.workspaceId,
      );
      const since = startOfDay(new Date());
      since.setUTCDate(since.getUTCDate() - input.days);

      const orderBy =
        input.sortBy === "sent"
          ? { sentCount: "desc" as const }
          : input.sortBy === "delivered"
            ? { deliveredCount: "desc" as const }
            : input.sortBy === "replied"
              ? { repliedCount: "desc" as const }
              : { sentCount: "desc" as const };

      const campaigns = await prisma.campaign.findMany({
        where: {
          workspaceId: { in: workspaceIds },
          createdAt: { gte: since },
          ...(input.channel !== "all" ? { channel: input.channel } : {}),
          status: { in: ["sending", "completed", "cancelled", "paused"] },
        },
        orderBy,
        ...(input.sortBy === "reply_rate" ? {} : { take: input.limit }),
        select: {
          id: true,
          name: true,
          channel: true,
          sentCount: true,
          deliveredCount: true,
          failedCount: true,
          repliedCount: true,
          completedAt: true,
          createdAt: true,
          workspace: {
            select: { name: true },
          },
        },
      });

      const rows = campaigns.map((c) => {
        const replyRate =
          c.sentCount > 0 ? (c.repliedCount / c.sentCount) * 100 : 0;
        const deliveryRate =
          c.sentCount > 0 ? (c.deliveredCount / c.sentCount) * 100 : 0;
        return {
          ...c,
          replyRate,
          deliveryRate,
        };
      });

      if (input.sortBy === "reply_rate") {
        rows.sort((a, b) => b.replyRate - a.replyRate);
      }

      return rows.slice(0, input.limit);
    }),

  exportReportingCsv: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().optional(),
        days: z.number().int().min(7).max(90).default(30),
        channel: z.enum(["all", "sms", "email"]).default("all"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceIds = await resolveWorkspaceIds(
        ctx.auth.user.id,
        input.workspaceId,
      );
      const since = startOfDay(new Date());
      since.setUTCDate(since.getUTCDate() - input.days);

      const campaigns = await prisma.campaign.findMany({
        where: {
          workspaceId: { in: workspaceIds },
          createdAt: { gte: since },
          ...(input.channel !== "all" ? { channel: input.channel } : {}),
          status: { in: ["sending", "completed", "cancelled", "paused"] },
        },
        orderBy: { createdAt: "desc" },
        select: {
          name: true,
          channel: true,
          sentCount: true,
          deliveredCount: true,
          failedCount: true,
          repliedCount: true,
          completedAt: true,
          createdAt: true,
          workspace: { select: { name: true } },
        },
      });

      const header =
        "Campaign,Channel,Sent,Delivered,Failed,Replied,Reply Rate,Delivery Rate,Date,Location\n";
      const rows = campaigns
        .map((c) => {
          const replyRate =
            c.sentCount > 0
              ? `${((c.repliedCount / c.sentCount) * 100).toFixed(1)}%`
              : "0.0%";
          const deliveryRate =
            c.sentCount > 0
              ? `${((c.deliveredCount / c.sentCount) * 100).toFixed(1)}%`
              : "0.0%";
          const date = (c.completedAt || c.createdAt)
            .toISOString()
            .slice(0, 10);
          const safeName = `"${c.name.replaceAll('"', '""')}"`;

          return [
            safeName,
            c.channel,
            c.sentCount,
            c.deliveredCount,
            c.failedCount,
            c.repliedCount,
            replyRate,
            deliveryRate,
            date,
            `"${(c.workspace?.name || "").replaceAll('"', '""')}"`,
          ].join(",");
        })
        .join("\n");

      return `${header}${rows}`;
    }),
});
