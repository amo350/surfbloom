import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { prisma } from "@/lib/prisma";
import { sendReviewSync } from "@/inngest/utils";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

export const reviewsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        page: z.number().default(1),
        pageSize: z.number().min(1).max(100).default(12),
        rating: z.number().min(1).max(5).optional(),
        hasResponse: z.boolean().optional(),
        sortBy: z
          .enum(["newest", "oldest", "lowest", "highest"])
          .default("newest"),
      }),
    )
    .query(async ({ input }) => {
      const { workspaceId, page, pageSize, rating, hasResponse, sortBy } =
        input;

      const where: any = { workspaceId };

      if (rating !== undefined) {
        where.rating = rating;
      }

      if (hasResponse === true) {
        where.ownerResponse = { not: null };
      } else if (hasResponse === false) {
        where.ownerResponse = null;
      }

      const orderBy: any = (() => {
        switch (sortBy) {
          case "newest":
            return { publishedAt: "desc" as const };
          case "oldest":
            return { publishedAt: "asc" as const };
          case "lowest":
            return [
              { rating: "asc" as const },
              { publishedAt: "desc" as const },
            ];
          case "highest":
            return [
              { rating: "desc" as const },
              { publishedAt: "desc" as const },
            ];
          default:
            return { publishedAt: "desc" as const };
        }
      })();

      const [items, totalCount, workspace] = await Promise.all([
        prisma.review.findMany({
          where,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            googleReviewId: true,
            authorName: true,
            authorImageUrl: true,
            rating: true,
            text: true,
            publishedAt: true,
            ownerResponse: true,
            ownerRespondedAt: true,
            source: true,
            firstSeenAt: true,
            lastSyncedAt: true,
          },
        }),
        prisma.review.count({ where }),
        prisma.workspace.findUnique({
          where: { id: workspaceId },
          select: { googlePlaceId: true, scrapedPlaceData: true },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        items,
        workspace: workspace ?? undefined,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    }),

  getStats: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ input }) => {
      const { workspaceId } = input;

      const [workspace, dbTotal, avgRating, unresponded, byRating] =
        await Promise.all([
          prisma.workspace.findUniqueOrThrow({
            where: { id: workspaceId },
            select: { scrapedPlaceData: true },
          }),
          prisma.review.count({ where: { workspaceId } }),
          prisma.review.aggregate({
            where: { workspaceId },
            _avg: { rating: true },
          }),
          prisma.review.count({
            where: { workspaceId, ownerResponse: null },
          }),
          prisma.review.groupBy({
            by: ["rating"],
            where: { workspaceId },
            _count: true,
            orderBy: { rating: "desc" },
          }),
        ]);

      const placeData = workspace.scrapedPlaceData as any;
      const googleTotal = placeData?.reviews ?? null;

      return {
        total: googleTotal ?? dbTotal,
        synced: dbTotal,
        averageRating: placeData?.rating
          ? Math.round(placeData.rating * 10) / 10
          : avgRating._avg.rating
            ? Math.round(avgRating._avg.rating * 10) / 10
            : null,
        unresponded,
        distribution: Object.fromEntries(
          byRating.map((r) => [r.rating, r._count]),
        ) as Record<number, number>,
      };
    }),

  sync: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        forceRefresh: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      await sendReviewSync({
        workspaceId: input.workspaceId,
        forceRefresh: input.forceRefresh,
      });
      return { success: true };
    }),
  generateResponse: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        workspaceId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const [review, workspace] = await Promise.all([
        prisma.review.findUniqueOrThrow({
          where: { id: input.reviewId },
          select: {
            rating: true,
            text: true,
            authorName: true,
            source: true,
          },
        }),
        prisma.workspace.findUniqueOrThrow({
          where: { id: input.workspaceId },
          select: { name: true, primaryCategory: true },
        }),
      ]);

      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
      });

      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system: `You are a friendly, professional business owner responding to a customer review.

Business: ${workspace.name}${workspace.primaryCategory ? ` (${workspace.primaryCategory})` : ""}

Rules:
- Keep it 2-3 sentences max
- Be genuine and warm, not corporate or generic
- If positive (4-5 stars): thank them sincerely, reference something specific from their review if possible
- If neutral (3 stars): thank them, acknowledge their experience, mention you're always improving
- If negative (1-2 stars): apologize sincerely, don't be defensive, offer to make it right
- Use their first name if available
- Don't use exclamation marks excessively
- Don't start with "Dear" or "Hi there"
- Never fabricate details not mentioned in the review`,
        prompt: `Review from ${review.authorName || "a customer"} (${review.rating}/5 stars):
${review.text || "(no text provided)"}

Write a response:`,
      });

      return { text };
    }),
});
