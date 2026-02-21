import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { LIBRARY_TEMPLATES, TEMPLATE_CATEGORIES } from "./library-templates";

const VALID_CATEGORIES = TEMPLATE_CATEGORIES.map((c) => c.value);

export const templateRouter = createTRPCRouter({
  // ─── LIST ─────────────────────────────────────────────
  getTemplates: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;

      // Auto-seed library templates
      const libraryCount = await prisma.campaignTemplate.count({
        where: { userId, isLibrary: true },
      });

      if (libraryCount === 0) {
        await prisma.campaignTemplate.createMany({
          data: LIBRARY_TEMPLATES.map((t) => ({
            userId,
            name: t.name,
            category: t.category,
            body: t.body,
            isLibrary: true,
          })),
          skipDuplicates: true,
        });
      }

      const where: any = { userId };

      if (input.category) {
        where.category = input.category;
      }

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { body: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const templates = await prisma.campaignTemplate.findMany({
        where,
        orderBy: [{ isLibrary: "desc" }, { updatedAt: "desc" }],
        include: {
          _count: { select: { campaigns: true } },
        },
      });

      return templates;
    }),

  // ─── GET ──────────────────────────────────────────────
  getTemplate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const template = await prisma.campaignTemplate.findUnique({
        where: { id: input.id },
        include: {
          _count: { select: { campaigns: true } },
          campaigns: {
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              name: true,
              status: true,
              sentCount: true,
              deliveredCount: true,
              repliedCount: true,
              createdAt: true,
            },
          },
        },
      });

      if (!template) throw new TRPCError({ code: "NOT_FOUND" });
      if (template.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return template;
    }),

  // ─── CREATE ───────────────────────────────────────────
  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(100),
        category: z.string().default("custom"),
        channel: z.string().default("sms"),
        subject: z.string().trim().max(200).optional(),
        body: z.string().trim().min(1).max(1600),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.campaignTemplate.create({
        data: {
          userId: ctx.auth.user.id,
          name: input.name,
          category: input.category,
          channel: input.channel,
          subject: input.subject || null,
          body: input.body,
          isLibrary: false,
        },
      });
    }),

  // ─── UPDATE ───────────────────────────────────────────
  updateTemplate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1).max(100).optional(),
        category: z.string().optional(),
        channel: z.string().optional(),
        subject: z.string().trim().max(200).nullable().optional(),
        body: z.string().trim().min(1).max(1600).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const template = await prisma.campaignTemplate.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!template) throw new TRPCError({ code: "NOT_FOUND" });
      if (template.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { id, ...data } = input;

      return prisma.campaignTemplate.update({
        where: { id },
        data,
      });
    }),

  // ─── DELETE ───────────────────────────────────────────
  deleteTemplate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await prisma.campaignTemplate.findUnique({
        where: { id: input.id },
        select: { userId: true, isLibrary: true },
      });

      if (!template) throw new TRPCError({ code: "NOT_FOUND" });
      if (template.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Can't delete library templates — only hide/reset
      if (template.isLibrary) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Library templates cannot be deleted",
        });
      }

      await prisma.campaignTemplate.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ─── DUPLICATE ────────────────────────────────────────
  duplicateTemplate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await prisma.campaignTemplate.findUnique({
        where: { id: input.id },
        select: {
          userId: true,
          name: true,
          category: true,
          channel: true,
          subject: true,
          body: true,
        },
      });

      if (!template) throw new TRPCError({ code: "NOT_FOUND" });
      if (template.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return prisma.campaignTemplate.create({
        data: {
          userId: ctx.auth.user.id,
          name: `${template.name} (copy)`,
          category: template.category,
          channel: template.channel,
          subject: template.subject,
          body: template.body,
          isLibrary: false,
        },
      });
    }),

  // ─── CATEGORIES ───────────────────────────────────────
  getCategories: protectedProcedure.query(() => {
    return TEMPLATE_CATEGORIES;
  }),

  // ─── TEMPLATE PERFORMANCE STATS ───────────────────────
  getTemplateStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id;

    const templates = await prisma.campaignTemplate.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        category: true,
        isLibrary: true,
        campaigns: {
          where: { status: { in: ["completed", "sending"] } },
          select: {
            id: true,
            totalRecipients: true,
            sentCount: true,
            deliveredCount: true,
            failedCount: true,
            repliedCount: true,
            variantB: true,
            variantASent: true,
            variantADelivered: true,
            variantAReplied: true,
            variantBSent: true,
            variantBDelivered: true,
            variantBReplied: true,
          },
        },
      },
    });

    return templates
      .map((t) => {
        const campaignCount = t.campaigns.length;
        if (campaignCount === 0) {
          return {
            id: t.id,
            name: t.name,
            category: t.category,
            isLibrary: t.isLibrary,
            campaignCount: 0,
            totalRecipients: 0,
            totalSent: 0,
            totalDelivered: 0,
            totalFailed: 0,
            totalReplied: 0,
            deliveryRate: 0,
            replyRate: 0,
            // A/B winner stats
            abTestCount: 0,
            variantAWins: 0,
            variantBWins: 0,
          };
        }

        let totalRecipients = 0;
        let totalSent = 0;
        let totalDelivered = 0;
        let totalFailed = 0;
        let totalReplied = 0;
        let abTestCount = 0;
        let variantAWins = 0;
        let variantBWins = 0;

        for (const c of t.campaigns) {
          totalRecipients += c.totalRecipients;
          totalSent += c.sentCount;
          totalDelivered += c.deliveredCount;
          totalFailed += c.failedCount;
          totalReplied += c.repliedCount;

          if (c.variantB) {
            abTestCount++;
            const aRate =
              c.variantASent > 0 ? c.variantAReplied / c.variantASent : 0;
            const bRate =
              c.variantBSent > 0 ? c.variantBReplied / c.variantBSent : 0;
            if (aRate > bRate) variantAWins++;
            else if (bRate > aRate) variantBWins++;
          }
        }

        return {
          id: t.id,
          name: t.name,
          category: t.category,
          isLibrary: t.isLibrary,
          campaignCount,
          totalRecipients,
          totalSent,
          totalDelivered,
          totalFailed,
          totalReplied,
          deliveryRate: totalSent > 0 ? totalDelivered / totalSent : 0,
          replyRate: totalSent > 0 ? totalReplied / totalSent : 0,
          abTestCount,
          variantAWins,
          variantBWins,
        };
      })
      .filter((t) => t.campaignCount > 0)
      .sort((a, b) => b.replyRate - a.replyRate);
  }),
});
