import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";

export const segmentRouter = createTRPCRouter({
  // ─── LIST ─────────────────────────────────────────────
  getSegments: protectedProcedure.query(async ({ ctx }) => {
    return prisma.savedSegment.findMany({
      where: { userId: ctx.auth.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { campaigns: true } },
      },
    });
  }),

  // ─── CREATE ───────────────────────────────────────────
  createSegment: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(100),
        audienceType: z.string().default("all"),
        audienceStage: z.string().optional(),
        audienceCategoryId: z.string().optional(),
        audienceInactiveDays: z.number().int().min(1).optional(),
        frequencyCapDays: z.number().int().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const count = await prisma.savedSegment.count({
        where: { userId: ctx.auth.user.id },
      });

      if (count >= 20) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum 20 saved segments allowed",
        });
      }

      return prisma.savedSegment.create({
        data: {
          userId: ctx.auth.user.id,
          name: input.name,
          audienceType: input.audienceType,
          audienceStage: input.audienceStage || null,
          audienceCategoryId: input.audienceCategoryId || null,
          audienceInactiveDays: input.audienceInactiveDays || null,
          frequencyCapDays: input.frequencyCapDays || null,
        },
      });
    }),

  // ─── UPDATE ───────────────────────────────────────────
  updateSegment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1).max(100).optional(),
        audienceType: z.string().optional(),
        audienceStage: z.string().nullable().optional(),
        audienceCategoryId: z.string().nullable().optional(),
        audienceInactiveDays: z.number().int().min(1).nullable().optional(),
        frequencyCapDays: z.number().int().min(1).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const segment = await prisma.savedSegment.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!segment) throw new TRPCError({ code: "NOT_FOUND" });
      if (segment.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { id, ...data } = input;

      return prisma.savedSegment.update({
        where: { id },
        data,
      });
    }),

  // ─── DELETE ───────────────────────────────────────────
  deleteSegment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const segment = await prisma.savedSegment.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!segment) throw new TRPCError({ code: "NOT_FOUND" });
      if (segment.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await prisma.savedSegment.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
