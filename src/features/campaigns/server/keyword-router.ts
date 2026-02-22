import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  generateQRCodeDataUrl,
  generateQRCodeSvg,
  buildSmsUri,
} from "../lib/qr-generator";

const RESERVED_KEYWORDS = [
  "stop",
  "unsubscribe",
  "cancel",
  "quit",
  "end",
  "start",
  "unstop",
  "subscribe",
  "yes",
  "help",
  "info",
];

export const keywordRouter = createTRPCRouter({
  // ─── LIST ─────────────────────────────────────────────
  getKeywords: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let workspaceIds: string[];

      if (input.workspaceId) {
        // Verify membership
        const membership = await prisma.member.findUnique({
          where: {
            userId_workspaceId: {
              userId: ctx.auth.user.id,
              workspaceId: input.workspaceId,
            },
          },
        });
        if (!membership) throw new TRPCError({ code: "FORBIDDEN" });
        workspaceIds = [input.workspaceId];
      } else {
        const userWorkspaces = await prisma.member.findMany({
          where: { userId: ctx.auth.user.id },
          select: { workspaceId: true },
        });
        workspaceIds = userWorkspaces.map((m) => m.workspaceId);
      }

      return prisma.textToJoinKeyword.findMany({
        where: { workspaceId: { in: workspaceIds } },
        orderBy: { createdAt: "desc" },
        include: {
          workspace: {
            select: {
              name: true,
              twilioPhoneNumber: { select: { phoneNumber: true } },
            },
          },
        },
      });
    }),

  // ─── CREATE ───────────────────────────────────────────
  createKeyword: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        keyword: z
          .string()
          .trim()
          .min(2)
          .max(20)
          .transform((v) => v.toUpperCase()),
        autoReply: z.string().trim().min(1).max(320),
        stage: z.string().default("new_lead"),
        categoryId: z.string().optional(),
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
      if (!membership) throw new TRPCError({ code: "FORBIDDEN" });

      // Check reserved keywords
      if (RESERVED_KEYWORDS.includes(input.keyword.toLowerCase())) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `"${input.keyword}" is a reserved keyword and cannot be used`,
        });
      }

      // Check alphanumeric only
      if (!/^[A-Z0-9]+$/.test(input.keyword)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Keywords can only contain letters and numbers",
        });
      }

      // Check uniqueness within workspace
      const existing = await prisma.textToJoinKeyword.findUnique({
        where: {
          workspaceId_keyword: {
            workspaceId: input.workspaceId,
            keyword: input.keyword,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Keyword "${input.keyword}" already exists for this location`,
        });
      }

      // Cap at 10 per workspace
      const count = await prisma.textToJoinKeyword.count({
        where: { workspaceId: input.workspaceId },
      });

      if (count >= 10) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum 10 keywords per location",
        });
      }

      return prisma.textToJoinKeyword.create({
        data: {
          workspaceId: input.workspaceId,
          keyword: input.keyword,
          autoReply: input.autoReply,
          stage: input.stage,
          categoryId: input.categoryId || null,
          source: "text_to_join",
        },
      });
    }),

  // ─── UPDATE ───────────────────────────────────────────
  updateKeyword: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        autoReply: z.string().trim().min(1).max(320).optional(),
        stage: z.string().optional(),
        categoryId: z.string().nullable().optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const keyword = await prisma.textToJoinKeyword.findUnique({
        where: { id: input.id },
        select: {
          workspaceId: true,
          workspace: { select: { members: { select: { userId: true } } } },
        },
      });

      if (!keyword) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = keyword.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      const { id, ...data } = input;

      return prisma.textToJoinKeyword.update({
        where: { id },
        data,
      });
    }),

  // ─── DELETE ───────────────────────────────────────────
  deleteKeyword: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const keyword = await prisma.textToJoinKeyword.findUnique({
        where: { id: input.id },
        select: {
          workspace: { select: { members: { select: { userId: true } } } },
        },
      });

      if (!keyword) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = keyword.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      await prisma.textToJoinKeyword.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ─── QR CODE ──────────────────────────────────────────
  getKeywordQR: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        format: z.enum(["png", "svg"]).default("png"),
        width: z.number().int().min(128).max(2048).default(512),
        darkColor: z.string().default("#000000"),
        lightColor: z.string().default("#FFFFFF"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const keyword = await prisma.textToJoinKeyword.findUnique({
        where: { id: input.id },
        select: {
          keyword: true,
          workspace: {
            select: {
              name: true,
              members: { select: { userId: true } },
              twilioPhoneNumber: { select: { phoneNumber: true } },
            },
          },
        },
      });

      if (!keyword) throw new TRPCError({ code: "NOT_FOUND" });

      const isMember = keyword.workspace.members.some(
        (m) => m.userId === ctx.auth.user.id,
      );
      if (!isMember) throw new TRPCError({ code: "FORBIDDEN" });

      const phone = keyword.workspace.twilioPhoneNumber?.phoneNumber;
      if (!phone) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No phone number configured for this location",
        });
      }

      const smsUri = buildSmsUri(phone, keyword.keyword);

      if (input.format === "svg") {
        const svg = await generateQRCodeSvg(smsUri, {
          width: input.width,
          darkColor: input.darkColor,
          lightColor: input.lightColor,
        });
        return {
          format: "svg" as const,
          data: svg,
          keyword: keyword.keyword,
          phone,
          businessName: keyword.workspace.name,
          smsUri,
        };
      }

      const dataUrl = await generateQRCodeDataUrl(smsUri, {
        width: input.width,
        darkColor: input.darkColor,
        lightColor: input.lightColor,
      });

      return {
        format: "png" as const,
        data: dataUrl,
        keyword: keyword.keyword,
        phone,
        businessName: keyword.workspace.name,
        smsUri,
      };
    }),
});
