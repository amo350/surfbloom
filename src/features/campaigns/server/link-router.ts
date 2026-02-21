import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const linkRouter = createTRPCRouter({
  // ─── GET LINKS FOR A CAMPAIGN ─────────────────────────
  getCampaignLinks: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ ctx, input }) => {
      const campaign = await prisma.campaign.findUnique({
        where: { id: input.campaignId },
        select: {
          workspace: { select: { members: { select: { userId: true } } } },
        },
      });

      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = campaign.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      const links = await prisma.campaignLink.findMany({
        where: { campaignId: input.campaignId },
        orderBy: { clickCount: "desc" },
        include: {
          _count: { select: { clicks: true } },
        },
      });

      return links;
    }),

  // ─── GET CLICKS FOR A LINK ────────────────────────────
  getLinkClicks: protectedProcedure
    .input(
      z.object({
        linkId: z.string(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input }) => {
      const [clicks, total] = await Promise.all([
        prisma.campaignLinkClick.findMany({
          where: { linkId: input.linkId },
          orderBy: { createdAt: "desc" },
          take: input.pageSize,
          skip: (input.page - 1) * input.pageSize,
          include: {
            recipient: {
              select: {
                contact: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        }),
        prisma.campaignLinkClick.count({ where: { linkId: input.linkId } }),
      ]);

      return { clicks, total };
    }),
});
