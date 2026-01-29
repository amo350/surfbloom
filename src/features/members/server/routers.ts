import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { MemberRole } from "@/generated/prisma/enums";
import { TRPCError } from "@trpc/server";

const TX_CONFLICT_CODES = ["P2034", "P2036", "P2037"];
const MAX_TX_RETRIES = 3;

async function withTxRetry<T>(
  fn: () => Promise<T>,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_TX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      const code = e && typeof e === "object" && "code" in e ? (e as { code: string }).code : "";
      if (e instanceof TRPCError || !TX_CONFLICT_CODES.includes(code)) {
        throw e;
      }
    }
  }
  throw lastError;
}

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

      // Fetch the target member scoped to this workspace
      const member = await prisma.member.findFirst({
        where: {
          id: input.memberId,
          workspaceId: input.workspaceId,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      // Prevent demoting the last admin: count + update atomically
      if (
        input.role !== MemberRole.ADMIN &&
        member.role === MemberRole.ADMIN
      ) {
        return withTxRetry(() =>
          prisma.$transaction(
            async (tx) => {
              const adminCount = await tx.member.count({
                where: {
                  workspaceId: input.workspaceId,
                  role: MemberRole.ADMIN,
                },
              });
              if (adminCount <= 1) {
                throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Cannot demote the last admin",
                });
              }
              return tx.member.update({
                where: { id: member.id },
                data: { role: input.role },
              });
            },
            { isolationLevel: "Serializable" },
          ),
        );
      }

      return prisma.member.update({
        where: { id: member.id },
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
      const memberToRemove = await prisma.member.findFirst({
        where: {
          id: input.memberId,
          workspaceId: input.workspaceId,
        },
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

      // Prevent removing last admin: count + delete atomically
      if (memberToRemove.role === MemberRole.ADMIN) {
        return withTxRetry(() =>
          prisma.$transaction(
            async (tx) => {
              const adminCount = await tx.member.count({
                where: {
                  workspaceId: input.workspaceId,
                  role: MemberRole.ADMIN,
                },
              });
              if (adminCount <= 1) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: "Cannot remove the last admin",
                });
              }
              return tx.member.delete({
                where: { id: memberToRemove.id },
              });
            },
            { isolationLevel: "Serializable" },
          ),
        );
      }

      return prisma.member.delete({
        where: { id: memberToRemove.id },
      });
    }),
});
