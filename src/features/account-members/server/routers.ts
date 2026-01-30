import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { AccountRole } from "@/generated/prisma/enums";
import { TRPCError } from "@trpc/server";

export const accountMembersRouter = createTRPCRouter({
  // Get all members with their workspace counts
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Remove the USER restriction - all authenticated users can view the list
      const currentUser = await prisma.user.findUnique({
        where: { id: ctx.auth.user.id },
      });

      if (!currentUser) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User not found",
        });
      }

      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: input.search, mode: "insensitive" } },
            { email: { contains: input.search, mode: "insensitive" } },
          ],
        },
        include: {
          mainWorkspace: { select: { id: true, name: true } },
          members: {
            select: { workspaceId: true },
          },
        },
        orderBy: [
          { accountRole: "asc" }, // OWNER first, then MANAGER, then USER
          { createdAt: "asc" },
        ],
      });

      return users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        accountRole: user.accountRole,
        mainWorkspace: user.mainWorkspace,
        locationCount: user.members.length,
        createdAt: user.createdAt,
      }));
    }),

  // Get workspaces for a member (for Set Main Location dialog)
  getMemberWorkspaces: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const currentUser = await prisma.user.findUnique({
        where: { id: ctx.auth.user.id },
      });

      if (!currentUser) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User not found",
        });
      }

      // USERs can only view their own workspaces (for setting main location)
      const isSelf = input.userId === ctx.auth.user.id;
      if (currentUser.accountRole === AccountRole.USER && !isSelf) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view this",
        });
      }

      const memberships = await prisma.member.findMany({
        where: { userId: input.userId },
        include: {
          workspace: {
            select: { id: true, name: true },
          },
        },
      });

      return memberships.map((m) => m.workspace);
    }),

  // Update account role
  updateRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.nativeEnum(AccountRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await prisma.user.findUnique({
        where: { id: ctx.auth.user.id },
      });

      if (!currentUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Target user not found",
        });
      }

      const isSelf = currentUser.id === input.userId;

      // USERs can only change their own role
      if (currentUser.accountRole === AccountRole.USER) {
        if (!isSelf) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only change your own role",
          });
        }
        // USERs cannot make themselves OWNER
        if (input.role === AccountRole.OWNER) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You cannot assign yourself as owner",
          });
        }
      }

      // Only OWNER can assign OWNER role
      if (
        input.role === AccountRole.OWNER &&
        currentUser.accountRole !== AccountRole.OWNER
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the account owner can assign owner role",
        });
      }

      // Only OWNER can change another OWNER's role
      if (
        targetUser.accountRole === AccountRole.OWNER &&
        currentUser.accountRole !== AccountRole.OWNER
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the account owner can modify owner roles",
        });
      }

      // MANAGER can only change USER roles (not other MANAGERs)
      if (
        currentUser.accountRole === AccountRole.MANAGER &&
        targetUser.accountRole === AccountRole.MANAGER &&
        targetUser.id !== currentUser.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Managers cannot change other managers' roles",
        });
      }

      // Prevent demoting the last OWNER
      if (
        targetUser.accountRole === AccountRole.OWNER &&
        input.role !== AccountRole.OWNER
      ) {
        const ownerCount = await prisma.user.count({
          where: { accountRole: AccountRole.OWNER },
        });

        if (ownerCount <= 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot demote the last account owner",
          });
        }
      }

      // When transferring OWNER, demote current OWNER to MANAGER
      if (input.role === AccountRole.OWNER && currentUser.accountRole === AccountRole.OWNER) {
        await prisma.$transaction([
          // Demote current owner to MANAGER
          prisma.user.update({
            where: { id: currentUser.id },
            data: { accountRole: AccountRole.MANAGER },
          }),
          // Promote target user to OWNER
          prisma.user.update({
            where: { id: input.userId },
            data: { accountRole: AccountRole.OWNER },
          }),
        ]);
        
        return { transferred: true };
      }

      return prisma.user.update({
        where: { id: input.userId },
        data: { accountRole: input.role },
      });
    }),

  // Bulk update roles
  bulkUpdateRole: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
        role: z.nativeEnum(AccountRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await prisma.user.findUnique({
        where: { id: ctx.auth.user.id },
      });

      if (!currentUser || currentUser.accountRole === AccountRole.USER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only managers and owners can update roles",
        });
      }

      // Only OWNER can assign OWNER role
      if (
        input.role === AccountRole.OWNER &&
        currentUser.accountRole !== AccountRole.OWNER
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the account owner can assign owner role",
        });
      }

      // Filter out users that can't be modified
      const targetUsers = await prisma.user.findMany({
        where: { id: { in: input.userIds } },
      });

      const validUserIds = targetUsers
        .filter((user) => {
          // Can't modify OWNERs unless you're an OWNER
          if (
            user.accountRole === AccountRole.OWNER &&
            currentUser.accountRole !== AccountRole.OWNER
          ) {
            return false;
          }
          // MANAGER can't modify other MANAGERs
          if (
            currentUser.accountRole === AccountRole.MANAGER &&
            user.accountRole === AccountRole.MANAGER &&
            user.id !== currentUser.id
          ) {
            return false;
          }
          return true;
        })
        .map((u) => u.id);

      await prisma.user.updateMany({
        where: { id: { in: validUserIds } },
        data: { accountRole: input.role },
      });

      return { updated: validUserIds.length };
    }),

  // Bulk invite to workspace
  bulkInviteToWorkspace: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
        workspaceId: z.string(),
        role: z.nativeEnum(AccountRole).default(AccountRole.USER),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await prisma.user.findUnique({
        where: { id: ctx.auth.user.id },
      });

      if (!currentUser || currentUser.accountRole === AccountRole.USER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only managers and owners can invite users",
        });
      }

      // Verify workspace exists
      const workspace = await prisma.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      // Get users who are not already members
      const existingMembers = await prisma.member.findMany({
        where: {
          workspaceId: input.workspaceId,
          userId: { in: input.userIds },
        },
        select: { userId: true },
      });

      const existingUserIds = new Set(existingMembers.map((m) => m.userId));
      const newUserIds = input.userIds.filter((id) => !existingUserIds.has(id));

      if (newUserIds.length === 0) {
        return { added: 0 };
      }

      // Create members
      await prisma.member.createMany({
        data: newUserIds.map((userId) => ({
          userId,
          workspaceId: input.workspaceId,
          role: "MEMBER", // Workspace role, not account role
        })),
      });

      return { added: newUserIds.length };
    }),

  // Bulk delete users
  bulkDelete: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await prisma.user.findUnique({
        where: { id: ctx.auth.user.id },
      });

      if (!currentUser || currentUser.accountRole !== AccountRole.OWNER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the account owner can delete users",
        });
      }

      // Can't delete yourself
      const userIdsToDelete = input.userIds.filter(
        (id) => id !== currentUser.id,
      );

      // Can't delete other OWNERs
      const targetUsers = await prisma.user.findMany({
        where: { id: { in: userIdsToDelete } },
      });

      const deletableIds = targetUsers
        .filter((u) => u.accountRole !== AccountRole.OWNER)
        .map((u) => u.id);

      await prisma.user.deleteMany({
        where: { id: { in: deletableIds } },
      });

      return { deleted: deletableIds.length };
    }),

  // Set main workspace for a user
  setMainWorkspace: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        workspaceId: z.string().nullable(), // Allow null to clear
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await prisma.user.findUnique({
        where: { id: ctx.auth.user.id },
      });

      if (!currentUser) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const isSelf = currentUser.id === input.userId;

      // USERs can only set their own main workspace
      if (currentUser.accountRole === AccountRole.USER && !isSelf) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only set your own main location",
        });
      }

      // MANAGERs and OWNERs can set anyone's

      // If workspaceId is provided, verify user is member of that workspace
      if (input.workspaceId) {
        const membership = await prisma.member.findUnique({
          where: {
            userId_workspaceId: {
              userId: input.userId,
              workspaceId: input.workspaceId,
            },
          },
        });

        if (!membership) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User is not a member of this workspace",
          });
        }
      }

      return prisma.user.update({
        where: { id: input.userId },
        data: { mainWorkspaceId: input.workspaceId },
      });
    }),
});
