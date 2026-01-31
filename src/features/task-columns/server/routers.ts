import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { MemberRole } from "@/generated/prisma/enums";

export const taskColumnsRouter = createTRPCRouter({
  // Get all columns for a workspace
  getMany: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const membership = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.workspaceId,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this workspace",
        });
      }

      return prisma.taskColumn.findMany({
        where: { workspaceId: input.workspaceId },
        orderBy: { position: "asc" },
        include: {
          _count: { select: { tasks: true } },
        },
      });
    }),

  // Update column (name, color) - ADMIN only
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        workspaceId: z.string(),
        name: z.string().trim().min(1).optional(),
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .optional(),
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

      if (!membership || membership.role !== MemberRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update columns",
        });
      }

      const { id, workspaceId, ...updateData } = input;

      return prisma.taskColumn.update({
        where: { id, workspaceId },
        data: updateData,
      });
    }),

  // Add column (max 7) - ADMIN only
  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        name: z.string().trim().min(1, "Required"),
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .default("#6B7280"),
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

      if (!membership || membership.role !== MemberRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can add columns",
        });
      }

      // Check column count (max 7)
      const columnCount = await prisma.taskColumn.count({
        where: { workspaceId: input.workspaceId },
      });

      if (columnCount >= 7) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum 7 columns allowed",
        });
      }

      // Get next position
      const lastColumn = await prisma.taskColumn.findFirst({
        where: { workspaceId: input.workspaceId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      return prisma.taskColumn.create({
        data: {
          workspaceId: input.workspaceId,
          name: input.name,
          color: input.color,
          position: (lastColumn?.position ?? 0) + 1,
        },
      });
    }),

  // Delete column (min 4) - ADMIN only
  remove: protectedProcedure
    .input(z.object({ id: z.string(), workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.workspaceId,
          },
        },
      });

      if (!membership || membership.role !== MemberRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete columns",
        });
      }

      // Check column count (min 4)
      const columnCount = await prisma.taskColumn.count({
        where: { workspaceId: input.workspaceId },
      });

      if (columnCount <= 4) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Minimum 4 columns required",
        });
      }

      // Check if column has tasks
      const taskCount = await prisma.task.count({
        where: { columnId: input.id },
      });

      if (taskCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Cannot delete column with tasks. Move or delete tasks first.",
        });
      }

      return prisma.taskColumn.delete({
        where: { id: input.id, workspaceId: input.workspaceId },
      });
    }),
});
