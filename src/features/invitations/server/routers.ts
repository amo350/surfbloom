import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { MemberRole, InvitationStatus } from "@/generated/prisma/enums";
import { TRPCError } from "@trpc/server";
import { AccountRole } from "@/generated/prisma/enums";

export const invitationsRouter = createTRPCRouter({
  // Create invitation (admin only)
  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        email: z.string().email("Invalid email"),
        role: z.nativeEnum(MemberRole).default(MemberRole.MEMBER),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify current user is admin of this workspace
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
          message: "Only admins can invite members",
        });
      }

      // Check if user is already a member
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        const existingMember = await prisma.member.findUnique({
          where: {
            userId_workspaceId: {
              userId: existingUser.id,
              workspaceId: input.workspaceId,
            },
          },
        });

        if (existingMember) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User is already a member of this workspace",
          });
        }
      }

      // Check if invitation already exists
      const existingInvitation = await prisma.invitation.findUnique({
        where: {
          email_workspaceId: {
            email: input.email.toLowerCase(),
            workspaceId: input.workspaceId,
          },
        },
      });

      if (
        existingInvitation &&
        existingInvitation.status === InvitationStatus.PENDING
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation already sent to this email",
        });
      }

      // TODO: Future - add payment increment for non-enterprise accounts when adding users

      // Create or update invitation
      const invitation = await prisma.invitation.upsert({
        where: {
          email_workspaceId: {
            email: input.email.toLowerCase(),
            workspaceId: input.workspaceId,
          },
        },
        update: {
          role: input.role,
          status: InvitationStatus.PENDING,
          invitedById: ctx.auth.user.id,
        },
        create: {
          email: input.email.toLowerCase(),
          workspaceId: input.workspaceId,
          role: input.role,
          invitedById: ctx.auth.user.id,
        },
        include: {
          workspace: { select: { name: true } },
        },
      });

      // TODO: Send email notification to invitee

      return invitation;
    }),

  // Get pending invitations for a workspace
  getByWorkspace: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify user is admin
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
          message: "Only admins can view invitations",
        });
      }

      return prisma.invitation.findMany({
        where: {
          workspaceId: input.workspaceId,
          status: InvitationStatus.PENDING,
        },
        include: {
          invitedBy: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Cancel/delete invitation
  remove: protectedProcedure
    .input(z.object({ id: z.string(), workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is admin
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
          message: "Only admins can cancel invitations",
        });
      }

      return prisma.invitation.delete({
        where: { id: input.id, workspaceId: input.workspaceId },
      });
    }),

  // Accept pending invitations for current user (called after login)
  // TODO: Future - add notification system for invitation accept/decline
  acceptPending: protectedProcedure.mutation(async ({ ctx }) => {
    const userEmail = ctx.auth.user.email.toLowerCase();

    // Find all pending invitations for this email
    const pendingInvitations = await prisma.invitation.findMany({
      where: {
        email: userEmail,
        status: InvitationStatus.PENDING,
      },
      include: {
        invitedBy: {
          select: {
            id: true,
            accountOwnerId: true,
            accountRole: true,
          },
        },
      },
    });

    if (pendingInvitations.length === 0) {
      return { accepted: 0 };
    }

    // Create memberships and update invitations
    await prisma.$transaction(async (tx) => {
      for (const invitation of pendingInvitations) {
        // Check if already a member (edge case)
        const existingMember = await tx.member.findUnique({
          where: {
            userId_workspaceId: {
              userId: ctx.auth.user.id,
              workspaceId: invitation.workspaceId,
            },
          },
        });

        if (!existingMember) {
          // Create membership
          await tx.member.create({
            data: {
              userId: ctx.auth.user.id,
              workspaceId: invitation.workspaceId,
              role: invitation.role,
            },
          });
        }

        // Update invitation status
        await tx.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.ACCEPTED },
        });

        // Set account ownership if user doesn't have one yet
        // The account owner is whoever invited them (or their account owner if they're not an owner)
        const currentUser = await tx.user.findUnique({
          where: { id: ctx.auth.user.id },
          select: { accountOwnerId: true, accountRole: true },
        });

        if (
          currentUser &&
          !currentUser.accountOwnerId &&
          currentUser.accountRole !== AccountRole.OWNER
        ) {
          // Determine the account owner from the inviter
          // If inviter is OWNER, they are the account owner
          // If inviter has an accountOwnerId, use that
          const accountOwnerId =
            invitation.invitedBy.accountRole === AccountRole.OWNER
              ? invitation.invitedBy.id
              : invitation.invitedBy.accountOwnerId;

          if (accountOwnerId) {
            await tx.user.update({
              where: { id: ctx.auth.user.id },
              data: { accountOwnerId },
            });
          }
        }
      }
    });

    return { accepted: pendingInvitations.length };
  }),
});
