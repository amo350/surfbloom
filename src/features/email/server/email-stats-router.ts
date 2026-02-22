import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";

export const emailStatsRouter = createTRPCRouter({
  // ─── CAMPAIGN EMAIL STATS ─────────────────────────────
  getCampaignEmailStats: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input }) => {
      const stats = await prisma.emailSend.groupBy({
        by: ["status"],
        where: { campaignId: input.campaignId },
        _count: true,
      });

      const totals = await prisma.emailSend.aggregate({
        where: { campaignId: input.campaignId },
        _count: true,
        _sum: {
          openCount: true,
          clickCount: true,
        },
      });

      const statusMap = new Map(stats.map((s) => [s.status, s._count]));

      const sent = totals._count || 0;
      const delivered = statusMap.get("delivered") || 0;
      const opened = statusMap.get("opened") || 0;
      const clicked = statusMap.get("clicked") || 0;
      const bounced = statusMap.get("bounced") || 0;
      const complained = statusMap.get("complained") || 0;

      // opened + clicked both count as "opened at least once"
      const uniqueOpens = opened + clicked;

      return {
        sent,
        delivered,
        uniqueOpens,
        totalOpens: totals._sum.openCount || 0,
        totalClicks: totals._sum.clickCount || 0,
        bounced,
        complained,
        openRate: sent > 0 ? uniqueOpens / sent : 0,
        clickRate: sent > 0 ? clicked / sent : 0,
        bounceRate: sent > 0 ? bounced / sent : 0,
      };
    }),

  // ─── RECENT EMAIL ACTIVITY ────────────────────────────
  getRecentEmailActivity: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input }) => {
      const { campaignId, page, limit } = input;
      const skip = (page - 1) * limit;

      const [sends, total] = await Promise.all([
        prisma.emailSend.findMany({
          where: { campaignId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          select: {
            id: true,
            toEmail: true,
            subject: true,
            status: true,
            openCount: true,
            clickCount: true,
            sentAt: true,
            deliveredAt: true,
            openedAt: true,
            bouncedAt: true,
            recipient: {
              select: {
                contact: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        }),
        prisma.emailSend.count({ where: { campaignId } }),
      ]);

      return { sends, total, page, limit };
    }),
});
