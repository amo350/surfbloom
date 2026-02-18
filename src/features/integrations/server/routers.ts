import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { prisma } from "@/lib/prisma";
import {
  createSubaccount,
  hasSubaccount,
  searchAvailableNumbers,
  provisionPhoneNumber,
  sendSms,
  updateNumberWebhook,
} from "@/lib/twilio";
import { TRPCError } from "@trpc/server";

export const integrationsRouter = createTRPCRouter({
  // ─── Twilio Config ──────────────────────────────────

  getTwilioConfig: protectedProcedure.query(async ({ ctx }) => {
    const config = await prisma.twilioConfig.findUnique({
      where: { userId: ctx.auth.user.id },
      select: {
        id: true,
        friendlyName: true,
        verificationStatus: true,
        createdAt: true,
      },
    });

    return config;
  }),

  setupTwilio: protectedProcedure.mutation(async ({ ctx }) => {
    const existing = await hasSubaccount(ctx.auth.user.id);

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Twilio is already set up for this account.",
      });
    }

    // Use the user's name or email as the business identifier
    const user = await prisma.user.findUnique({
      where: { id: ctx.auth.user.id },
      select: { name: true, email: true },
    });

    const businessName = user?.name || user?.email || "Unknown";

    const result = await createSubaccount(ctx.auth.user.id, businessName);

    return {
      friendlyName: result.friendlyName,
    };
  }),

  disconnectTwilio: protectedProcedure.mutation(async ({ ctx }) => {
    // Note: does NOT delete the Twilio subaccount, just unlinks locally
    await prisma.twilioConfig.deleteMany({
      where: { userId: ctx.auth.user.id },
    });
    return { success: true };
  }),

  // ─── Phone Numbers (unchanged) ─────────────────────

  getPhoneNumbers: protectedProcedure.query(async ({ ctx }) => {
    return prisma.twilioPhoneNumber.findMany({
      where: {
        workspace: {
          members: { some: { userId: ctx.auth.user.id } },
        },
      },
      include: {
        workspace: {
          select: { id: true, name: true, imageUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getWorkspaceSmsNumber: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const number = await prisma.twilioPhoneNumber.findUnique({
        where: { workspaceId: input.workspaceId },
        select: { phoneNumber: true },
      });
      return number;
    }),

  searchNumbers: protectedProcedure
    .input(
      z.object({
        areaCode: z.string().optional(),
        country: z.string().default("US"),
        type: z.enum(["local", "tollFree"]).default("local"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const numbers = await searchAvailableNumbers(
          ctx.auth.user.id,
          input.areaCode,
          input.country,
          input.type,
        );
        return numbers.map((n) => ({
          phoneNumber: n.phoneNumber,
          friendlyName: n.friendlyName,
          locality: n.locality,
          region: n.region,
        }));
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to search numbers. Verify your Twilio connection.",
        });
      }
    }),

  provisionNumber: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string().startsWith("+"),
        workspaceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.workspaceId,
          },
        },
      });

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const existing = await prisma.twilioPhoneNumber.findUnique({
        where: { workspaceId: input.workspaceId },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This location already has a phone number assigned.",
        });
      }

      try {
        const result = await provisionPhoneNumber(
          ctx.auth.user.id,
          input.phoneNumber,
          process.env.NEXT_PUBLIC_APP_URL,
        );

        const record = await prisma.twilioPhoneNumber.create({
          data: {
            workspaceId: input.workspaceId,
            phoneNumber: result.phoneNumber,
            phoneSid: result.sid,
            friendlyName: result.friendlyName,
          },
        });

        // Auto-fill workspace phone if empty
        const workspace = await prisma.workspace.findUnique({
          where: { id: input.workspaceId },
          select: { phone: true },
        });

        if (!workspace?.phone) {
          await prisma.workspace.update({
            where: { id: input.workspaceId },
            data: { phone: result.phoneNumber },
          });
        }

        return record;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to provision number. Check your Twilio account balance.",
        });
      }
    }),

  updateWebhook: protectedProcedure
    .input(z.object({ phoneNumberId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const record = await prisma.twilioPhoneNumber.findUnique({
        where: { id: input.phoneNumberId },
      });

      if (!record?.phoneSid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Twilio SID for this number.",
        });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!appUrl || appUrl.includes("localhost")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Set NEXT_PUBLIC_APP_URL to a public URL (use ngrok for testing).",
        });
      }

      await updateNumberWebhook(ctx.auth.user.id, record.phoneSid, appUrl);
      return { success: true };
    }),

  removeNumber: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const number = await prisma.twilioPhoneNumber.findUnique({
        where: { id: input.id },
        include: {
          workspace: {
            select: {
              members: { where: { userId: ctx.auth.user.id } },
            },
          },
        },
      });

      if (!number || number.workspace.members.length === 0) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return prisma.twilioPhoneNumber.delete({
        where: { id: input.id },
      });
    }),

  sendSms: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        to: z.string().startsWith("+", "Phone number must be in E.164 format"),
        body: z.string().min(1).max(1600),
        mediaUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the workspace's phone number
      const phoneNumber = await prisma.twilioPhoneNumber.findUnique({
        where: { workspaceId: input.workspaceId },
      });

      if (!phoneNumber) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This location has no SMS number. Assign one in Integrations.",
        });
      }

      try {
        const result = await sendSms({
          userId: ctx.auth.user.id,
          from: phoneNumber.phoneNumber,
          to: input.to,
          body: input.body,
          mediaUrl: input.mediaUrl,
        });

        // Store in DB
        await prisma.smsMessage.create({
          data: {
            workspaceId: input.workspaceId,
            direction: "outbound",
            from: phoneNumber.phoneNumber,
            to: input.to,
            body: input.body,
            mediaUrl: input.mediaUrl,
            twilioSid: result.sid,
            status: "SENT",
          },
        });

        return { sid: result.sid, status: result.status };
      } catch (error) {
        console.error("SMS send error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send SMS. Check your Twilio account and phone number.",
        });
      }
    }),

  testSms: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        to: z.string().startsWith("+"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const phoneNumber = await prisma.twilioPhoneNumber.findUnique({
        where: { workspaceId: input.workspaceId },
      });

      if (!phoneNumber) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No SMS number for this location.",
        });
      }

      const result = await sendSms({
        userId: ctx.auth.user.id,
        from: phoneNumber.phoneNumber,
        to: input.to,
        body: "This is a test message from SurfBloom. If you received this, SMS is working.",
      });

      await prisma.smsMessage.create({
        data: {
          workspaceId: input.workspaceId,
          direction: "outbound",
          from: phoneNumber.phoneNumber,
          to: input.to,
          body: "This is a test message from SurfBloom.",
          twilioSid: result.sid,
          status: "SENT",
        },
      });

      return { sid: result.sid };
    }),
});
