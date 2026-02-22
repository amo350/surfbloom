import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";

const EMAIL_CATEGORIES = [
  { value: "custom", label: "Custom" },
  { value: "review_request", label: "Review Request" },
  { value: "welcome", label: "Welcome" },
  { value: "promo", label: "Promotional" },
  { value: "newsletter", label: "Newsletter" },
  { value: "follow_up", label: "Follow-Up" },
  { value: "re_engagement", label: "Re-Engagement" },
  { value: "announcement", label: "Announcement" },
] as const;

const categoryValues = EMAIL_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
];

const LIBRARY_EMAIL_TEMPLATES = [
  {
    name: "Review Request",
    category: "review_request",
    subject: "How was your experience at {location_name}?",
    htmlBody: `<p>Hi {first_name},</p>
<p>Thank you for choosing {location_name}! We'd love to hear about your experience.</p>
<p>If you have a moment, please <a href="#">leave us a review</a>. Your feedback helps us serve you better and helps others discover us.</p>
<p>Thank you for your support!</p>
<p>— The {location_name} Team</p>`,
  },
  {
    name: "Welcome Email",
    category: "welcome",
    subject: "Welcome to {location_name}!",
    htmlBody: `<p>Hi {first_name},</p>
<p>Welcome to the {location_name} family! We're so glad you're here.</p>
<p>Here's what you can expect from us:</p>
<p>• Exclusive offers and promotions<br>• Updates on new products and services<br>• Tips and content we think you'll love</p>
<p>If you ever need anything, just reply to this email or give us a call.</p>
<p>Cheers,<br>The {location_name} Team</p>`,
  },
  {
    name: "Promotional Offer",
    category: "promo",
    subject: "Special offer just for you, {first_name}!",
    htmlBody: `<p>Hey {first_name},</p>
<p>We've got something special for you at {location_name}.</p>
<p style="padding:16px;background:#f0fdfa;border-radius:8px;text-align:center;font-size:18px;font-weight:bold;color:#0d9488">Your exclusive offer goes here</p>
<p>Don't wait too long — this offer won't last forever!</p>
<p>See you soon,<br>{location_name}</p>`,
  },
  {
    name: "Re-Engagement",
    category: "re_engagement",
    subject: "We miss you, {first_name}!",
    htmlBody: `<p>Hey {first_name},</p>
<p>It's been a while since we've seen you at {location_name}, and we wanted to reach out.</p>
<p>We've been working on some exciting things, and we'd love for you to come check them out.</p>
<p>As a little incentive, here's something special just for you:</p>
<p style="padding:16px;background:#fef3c7;border-radius:8px;text-align:center;font-size:16px;font-weight:bold;color:#92400e">Your welcome-back offer here</p>
<p>Hope to see you soon!</p>
<p>— {location_name}</p>`,
  },
  {
    name: "Newsletter",
    category: "newsletter",
    subject: "What's new at {location_name}",
    htmlBody: `<p>Hi {first_name},</p>
<p>Here's what's been happening at {location_name}:</p>
<h3 style="color:#18181b;font-size:16px;margin:24px 0 8px">📌 Update #1</h3>
<p>Share your latest news, event, or update here.</p>
<h3 style="color:#18181b;font-size:16px;margin:24px 0 8px">📌 Update #2</h3>
<p>Another piece of news or content for your audience.</p>
<h3 style="color:#18181b;font-size:16px;margin:24px 0 8px">📌 Update #3</h3>
<p>One more thing you want your customers to know about.</p>
<p>Thanks for being part of our community!</p>
<p>— The {location_name} Team</p>`,
  },
];

export { EMAIL_CATEGORIES };

export const emailTemplateRouter = createTRPCRouter({
  // ─── LIST ─────────────────────────────────────────────
  getTemplates: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;

      // Auto-seed library templates
      const libraryCount = await prisma.emailTemplate.count({
        where: { userId, isLibrary: true },
      });

      if (libraryCount === 0) {
        await prisma.emailTemplate.createMany({
          data: LIBRARY_EMAIL_TEMPLATES.map((t) => ({
            userId,
            name: t.name,
            category: t.category,
            subject: t.subject,
            htmlBody: t.htmlBody,
            isLibrary: true,
          })),
          skipDuplicates: true,
        });
      }

      const where: any = { userId };
      if (input.category) where.category = input.category;
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { subject: { contains: input.search, mode: "insensitive" } },
        ];
      }

      return prisma.emailTemplate.findMany({
        where,
        orderBy: [{ isLibrary: "asc" }, { updatedAt: "desc" }],
      });
    }),

  // ─── GET ONE ──────────────────────────────────────────
  getTemplate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const template = await prisma.emailTemplate.findUnique({
        where: { id: input.id },
      });

      if (!template || template.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return template;
    }),

  // ─── CREATE ───────────────────────────────────────────
  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(100),
        category: z.enum(categoryValues).default("custom"),
        subject: z.string().trim().min(1).max(200),
        htmlBody: z.string().trim().min(1).max(50000),
        textBody: z.string().max(10000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.emailTemplate.create({
        data: {
          userId: ctx.auth.user.id,
          name: input.name,
          category: input.category,
          subject: input.subject,
          htmlBody: input.htmlBody,
          textBody: input.textBody || null,
          isLibrary: false,
        },
      });
    }),

  // ─── UPDATE ───────────────────────────────────────────
  updateTemplate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1).max(100).optional(),
        category: z.enum(categoryValues).optional(),
        subject: z.string().trim().min(1).max(200).optional(),
        htmlBody: z.string().trim().min(1).max(50000).optional(),
        textBody: z.string().max(10000).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const template = await prisma.emailTemplate.findUnique({
        where: { id: input.id },
        select: { userId: true, isLibrary: true },
      });

      if (!template || template.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (template.isLibrary) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Library templates cannot be edited. Duplicate it first.",
        });
      }

      const { id, ...data } = input;
      return prisma.emailTemplate.update({ where: { id }, data });
    }),

  // ─── DELETE ───────────────────────────────────────────
  deleteTemplate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await prisma.emailTemplate.findUnique({
        where: { id: input.id },
        select: { userId: true, isLibrary: true },
      });

      if (!template || template.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (template.isLibrary) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Library templates cannot be deleted",
        });
      }

      await prisma.emailTemplate.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ─── DUPLICATE ────────────────────────────────────────
  duplicateTemplate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await prisma.emailTemplate.findUnique({
        where: { id: input.id },
      });

      if (!template || template.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return prisma.emailTemplate.create({
        data: {
          userId: ctx.auth.user.id,
          name: `${template.name} (copy)`,
          category: template.category,
          subject: template.subject,
          htmlBody: template.htmlBody,
          textBody: template.textBody,
          isLibrary: false,
        },
      });
    }),

  // ─── CATEGORIES ───────────────────────────────────────
  getCategories: protectedProcedure.query(() => EMAIL_CATEGORIES),
});
