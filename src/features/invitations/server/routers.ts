import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { MemberRole, InvitationStatus } from "@/generated/prisma/enums";
import { TRPCError } from "@trpc/server";

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
  acceptPending: protectedProcedure.mutation(async ({ ctx }) => {
    const userEmail = ctx.auth.user.email;

    // Find all pending invitations for this email
    const pendingInvitations = await prisma.invitation.findMany({
      where: {
        email: userEmail.toLowerCase(),
        status: InvitationStatus.PENDING,
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
      }
    });

    return { accepted: pendingInvitations.length };
  }),
});