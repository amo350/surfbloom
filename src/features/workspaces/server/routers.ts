import { TRPCError } from "@trpc/server";
import { z } from "zod";
import PAGINATION from "@/config/constants";
import { AccountRole, MemberRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { generateInviteCode } from "@/lib/utils";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

// TODO: Premium/billing is per-workspace, not per-account
// When checking premium features, check workspace.isPremium, not user subscription

export const workspacesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1, "Required"),
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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

        // Create default task columns
        const defaultColumns = [
          { name: "Overdue", color: "#EF4444", position: 1 },
          { name: "Priority 1", color: "#F97316", position: 2 },
          { name: "Priority 2", color: "#3B82F6", position: 3 },
          { name: "Completed", color: "#10B981", position: 4 },
          { name: "Verified", color: "#8B5CF6", position: 5 },
        ];

        await tx.taskColumn.createMany({
          data: defaultColumns.map((col) => ({
            ...col,
            workspaceId: workspace.id,
          })),
        });

        return workspace;
      });

      return workspace;
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
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
          message: "You do not have access to this workspace",
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
        address: workspace.address,
        city: workspace.city,
        state: workspace.state,
        zipCode: workspace.zipCode,
        lastScrapedAt: workspace.lastScrapedAt,
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
          select: {
            id: true,
            name: true,
            imageUrl: true,
            inviteCode: true,
            createdAt: true,
            updatedAt: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            phone: true,
            website: true,
            latitude: true,
            longitude: true,
            timezone: true,
            primaryCategory: true,
            secondaryCategories: true,
            googleRating: true,
            googleReviewCount: true,
            userId: true,
            googlePlaceId: true,
            scrapedPlaceData: true,
            scrapedCompetitors: true,
            lastScrapedAt: true,
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
      // Get user's account role
      const currentUser = await prisma.user.findUnique({
        where: { id: ctx.auth.user.id },
        select: { accountRole: true },
      });

      // Only OWNER (account level) can delete workspaces
      if (!currentUser || currentUser.accountRole !== AccountRole.OWNER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only account owners can delete workspaces",
        });
      }

      // Verify user has access to this workspace
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
          message: "You do not have access to this workspace",
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
        imageUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const membership = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.id,
          },
        },
      });

      // ADMIN (workspace level) can update settings
      if (!membership || membership.role !== MemberRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only workspace admins can update settings",
        });
      }

      return prisma.workspace.update({
        where: { id: input.id },
        data: {
          name: input.name,
          imageUrl: input.imageUrl,
        },
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
      const membership = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.id,
          },
        },
      });

      // ADMIN (workspace level) can update settings
      if (!membership || membership.role !== MemberRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only workspace admins can update settings",
        });
      }

      return prisma.workspace.update({
        where: { id: input.id },
        data: { inviteCode: generateInviteCode(7) },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1, "Required").optional(),
        imageUrl: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        zipCode: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const membership = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.id,
          },
        },
      });

      // ADMIN (workspace level) can update settings
      if (!membership || membership.role !== MemberRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only workspace admins can update settings",
        });
      }

      const updateData: Record<string, any> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
      if (input.address !== undefined) updateData.address = input.address;
      if (input.city !== undefined) updateData.city = input.city;
      if (input.state !== undefined) updateData.state = input.state;
      if (input.zipCode !== undefined) updateData.zipCode = input.zipCode;

      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields provided to update",
        });
      }

      return prisma.workspace.update({
        where: { id: input.id },
        data: updateData,
      });
    }),
});
