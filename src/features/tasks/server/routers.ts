import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { MemberRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const tasksRouter = createTRPCRouter({
  // Get all tasks for a workspace
  getMany: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        columnId: z.string().optional(),
        assigneeId: z.string().optional(),
        search: z.string().optional(),
        dueDateFrom: z.coerce.date().optional(),
        dueDateTo: z.coerce.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify membership
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

      // Returns full Task (all scalars including taskNumber) + column + assignee
      const tasks = await prisma.task.findMany({
        where: {
          workspaceId: input.workspaceId,
          ...(input.columnId && { columnId: input.columnId }),
          ...(input.assigneeId && { assigneeId: input.assigneeId }),
          ...(input.search && {
            OR: [
              { name: { contains: input.search, mode: "insensitive" } },
              ...(input.search.replace("#", "").match(/^\d+$/)
                ? [{ taskNumber: parseInt(input.search.replace("#", ""), 10) }]
                : []),
            ],
          }),
          ...(input.dueDateFrom && {
            dueDate: { gte: input.dueDateFrom },
          }),
          ...(input.dueDateTo && {
            dueDate: { lte: input.dueDateTo },
          }),
        },
        include: {
          column: true,
          assignee: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { position: "asc" },
      });

      return tasks;
    }),

  // Get single task
  getOne: protectedProcedure
    .input(z.object({ id: z.string(), workspaceId: z.string() }))
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

      // Returns full Task (all scalars including taskNumber) + column + assignee
      return prisma.task.findUniqueOrThrow({
        where: { id: input.id, workspaceId: input.workspaceId },
        include: {
          column: true,
          assignee: {
            select: { id: true, name: true, image: true },
          },
        },
      });
    }),

  // Create task
  create: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        workspaceId: z.string(),
        columnId: z.string(),
        name: z.string().trim().min(1, "Required"),
        description: z.string().optional(),
        assigneeId: z.string().optional(),
        dueDate: z.coerce.date().optional(),
        startDate: z.coerce.date().optional(),
        category: z.string().optional(),
        reviewId: z.string().optional(),
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

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this workspace",
        });
      }

      // Verify column belongs to workspace
      const column = await prisma.taskColumn.findFirst({
        where: { id: input.columnId, workspaceId: input.workspaceId },
      });
      if (!column) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Column not found in this workspace",
        });
      }

      // Get next task number for this workspace
      const lastTask = await prisma.task.findFirst({
        where: { workspaceId: input.workspaceId },
        orderBy: { taskNumber: "desc" },
        select: { taskNumber: true },
      });
      const nextNumber = (lastTask?.taskNumber ?? 0) + 1;

      // Get highest position in this column (for Kanban ordering)
      const highestTask = await prisma.task.findFirst({
        where: {
          workspaceId: input.workspaceId,
          columnId: input.columnId,
        },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      const newPosition = highestTask ? highestTask.position + 1000 : 1000;

      return prisma.task.create({
        data: {
          ...(input.id && { id: input.id }),
          workspaceId: input.workspaceId,
          columnId: input.columnId,
          name: input.name,
          taskNumber: nextNumber,
          description: input.description,
          assigneeId: input.assigneeId,
          dueDate: input.dueDate,
          startDate: input.startDate,
          category: input.category,
          ...(input.reviewId != null && { reviewId: input.reviewId }),
          position: newPosition,
        },
        include: {
          column: true,
          assignee: {
            select: { id: true, name: true, image: true },
          },
        },
      });
    }),

  // Update task
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        workspaceId: z.string(),
        columnId: z.string().optional(),
        name: z.string().trim().min(1).optional(),
        description: z.string().optional().nullable(),
        assigneeId: z.string().optional().nullable(),
        dueDate: z.coerce.date().optional().nullable(),
        startDate: z.coerce.date().optional().nullable(),
        category: z.string().optional().nullable(),
        position: z.number().optional(),
        reviewId: z.string().optional().nullable(),
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

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this workspace",
        });
      }

      const { id, workspaceId, ...updateData } = input;

      return prisma.task.update({
        where: { id, workspaceId },
        data: updateData,
        include: {
          column: true,
          assignee: {
            select: { id: true, name: true, image: true },
          },
        },
      });
    }),

  // Delete task (ADMIN only)
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
          message: "Only admins can delete tasks",
        });
      }

      return prisma.task.delete({
        where: { id: input.id, workspaceId: input.workspaceId },
      });
    }),

  // Bulk update positions (for drag & drop)
  bulkUpdatePositions: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        updates: z.array(
          z.object({
            id: z.string(),
            columnId: z.string(),
            position: z.number(),
          }),
        ),
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

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this workspace",
        });
      }

      await prisma.$transaction(
        input.updates.map((update) =>
          prisma.task.update({
            where: { id: update.id, workspaceId: input.workspaceId },
            data: {
              columnId: update.columnId,
              position: update.position,
            },
          }),
        ),
      );

      return { success: true };
    }),
  bulkRemove: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        ids: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify membership
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

      // Only ADMIN or OWNER can delete
      if (membership.role === "MEMBER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete tasks",
        });
      }

      // Delete all tasks that belong to this workspace
      await prisma.task.deleteMany({
        where: {
          id: { in: input.ids },
          workspaceId: input.workspaceId,
        },
      });

      return { success: true, count: input.ids.length };
    }),
});
