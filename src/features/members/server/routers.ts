import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { MemberRole } from "@/generated/prisma/enums";
import { TRPCError } from "@trpc/server";

export const membersRouter = createTRPCRouter({
  // Get members of a workspace
  getByWorkspace: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify user is a member of this workspace
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
          message: "You are not a member of this workspace",
        });
      }

      return prisma.member.findMany({
        where: { workspaceId: input.workspaceId },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  // Update member role (admin only)
  updateRole: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
        workspaceId: z.string(),
        role: z.nativeEnum(MemberRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify current user is admin
      const currentMembership = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.workspaceId,
          },
        },
      });

      if (!currentMembership || currentMembership.role !== MemberRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update member roles",
        });
      }

      return prisma.member.update({
        where: { id: input.memberId },
        data: { role: input.role },
      });
    }),

  // Remove member (admin only, or self)
  remove: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
        workspaceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const memberToRemove = await prisma.member.findUnique({
        where: { id: input.memberId },
      });

      if (!memberToRemove) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      }

      // User can remove themselves
      const isSelf = memberToRemove.userId === ctx.auth.user.id;

      // Or admin can remove others
      const currentMembership = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.workspaceId,
          },
        },
      });

      const isAdmin = currentMembership?.role === MemberRole.ADMIN;

      if (!isSelf && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot remove this member",
        });
      }

      // Prevent removing last admin
      if (memberToRemove.role === MemberRole.ADMIN) {
        const adminCount = await prisma.member.count({
          where: { workspaceId: input.workspaceId, role: MemberRole.ADMIN },
        });

        if (adminCount <= 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot remove the last admin",
          });
        }
      }

      return prisma.member.delete({
        where: { id: input.memberId },
      });
    }),
});
