import { z } from "zod";
import PAGINATION from "@/config/constants";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { generateInviteCode } from "@/lib/utils";
import { MemberRole } from "@/generated/prisma/enums";
import { TRPCError } from "@trpc/server";

export const workspacesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1, "Required"),
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create workspace and member in a transaction
      const workspace = await prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: {
            name: input.name,
            imageUrl: input.imageUrl,
            inviteCode: generateInviteCode(7),
            userId: ctx.auth.user.id,
          },
        });

        // Create membership for creator as ADMIN
        await tx.member.create({
          data: {
            userId: ctx.auth.user.id,
            workspaceId: workspace.id,
            role: MemberRole.ADMIN,
          },
        });

        return workspace;
      });

      return workspace;
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify user is a member
      const membership = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.id,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this workspace",
        });
      }

      const workspace = await prisma.workspace.findUniqueOrThrow({
        where: { id: input.id },
      });

      return {
        id: workspace.id,
        name: workspace.name,
        imageUrl: workspace.imageUrl,
        inviteCode: workspace.inviteCode,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      // First get all workspace IDs where user is a member
      const memberships = await prisma.member.findMany({
        where: { userId: ctx.auth.user.id },
        select: { workspaceId: true },
      });

      const workspaceIds = memberships.map((m) => m.workspaceId);

      // If no memberships, return empty
      if (workspaceIds.length === 0) {
        return {
          items: [],
          page,
          pageSize,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      }

      // Get workspaces where user is a member
      const [items, totalCount] = await Promise.all([
        prisma.workspace.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            id: { in: workspaceIds },
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.workspace.count({
          where: {
            id: { in: workspaceIds },
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is admin
      const membership = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.id,
          },
        },
      });

      if (!membership || membership.role !== MemberRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete workspaces",
        });
      }

      return prisma.workspace.delete({
        where: { id: input.id },
      });
    }),

updateName: protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().trim().min(1, "Required"),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // Verify user is admin
    const membership = await prisma.member.findUnique({
      where: {
        userId_workspaceId: {
          userId: ctx.auth.user.id,
          workspaceId: input.id,
        },
      },
    });

    if (!membership || membership.role !== MemberRole.ADMIN) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can update workspace name",
      });
    }

    return prisma.workspace.update({
      where: { id: input.id },
      data: { name: input.name },
    });
  }),

  join: protectedProcedure
  .input(z.object({ inviteCode: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Find workspace by invite code
    const workspace = await prisma.workspace.findUnique({
      where: { inviteCode: input.inviteCode },
    });

    if (!workspace) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Invalid invite code",
      });
    }

    // Check if already a member
    const existingMembership = await prisma.member.findUnique({
      where: {
        userId_workspaceId: {
          userId: ctx.auth.user.id,
          workspaceId: workspace.id,
        },
      },
    });

    if (existingMembership) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You are already a member of this workspace",
      });
    }

    // Create membership
    await prisma.member.create({
      data: {
        userId: ctx.auth.user.id,
        workspaceId: workspace.id,
        role: MemberRole.MEMBER,
      },
    });

    return workspace;
  }),

  resetInviteCode: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Verify user is admin
    const membership = await prisma.member.findUnique({
      where: {
        userId_workspaceId: {
          userId: ctx.auth.user.id,
          workspaceId: input.id,
        },
      },
    });

    if (!membership || membership.role !== MemberRole.ADMIN) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can reset invite code",
      });
    }

    return prisma.workspace.update({
      where: { id: input.id },
      data: { inviteCode: generateInviteCode(7) },
    });
  }),
});