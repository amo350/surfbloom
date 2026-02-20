// src/features/contacts/server/routers.ts
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { logActivity } from "./log-activity";

async function verifyContactAccess(userId: string, contactId: string) {
  const contact = await prisma.chatContact.findUnique({
    where: { id: contactId },
    select: { workspaceId: true },
  });
  if (!contact) throw new TRPCError({ code: "NOT_FOUND" });

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId: contact.workspaceId,
      },
    },
  });
  if (!member) throw new TRPCError({ code: "FORBIDDEN" });

  return contact;
}

async function verifyCategoryAccess(userId: string, categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { workspaceId: true },
  });
  if (!category) throw new TRPCError({ code: "NOT_FOUND" });

  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId: category.workspaceId,
      },
    },
  });
  if (!member) throw new TRPCError({ code: "FORBIDDEN" });

  return category;
}

const STAGES = [
  "new_lead",
  "prospecting",
  "appointment",
  "payment",
  "not_a_fit",
  "lost",
] as const;

const SOURCES = [
  "manual",
  "csv",
  "webhook",
  "chatbot",
  "sms",
  "feedback",
  "review_campaign",
] as const;

export const contactsRouter = createTRPCRouter({
  getContacts: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().optional(),
        search: z.string().optional(),
        stage: z.enum(STAGES).optional(),
        source: z.enum(SOURCES).optional(),
        categoryId: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search, stage, source, categoryId, page, pageSize } = input;

      // Get user's workspaces
      const userWorkspaces = await prisma.member.findMany({
        where: { userId: ctx.auth.user.id },
        select: { workspaceId: true },
      });
      const workspaceIds = userWorkspaces.map((m) => m.workspaceId);

      const where: any = {
        workspaceId: input.workspaceId
          ? input.workspaceId
          : { in: workspaceIds },
      };

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
        ];
      }

      if (stage) where.stage = stage;
      if (source) where.source = source;

      if (categoryId) {
        where.categories = {
          some: { categoryId },
        };
      }
      where.isContact = true;

      const [contacts, totalCount] = await Promise.all([
        prisma.chatContact.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            imageUrl: true,
            stage: true,
            source: true,
            lastContactedAt: true,
            createdAt: true,
            workspace: {
              select: { id: true, name: true },
            },
            categories: {
              select: {
                category: {
                  select: { id: true, name: true, color: true },
                },
              },
            },
          },
        }),
        prisma.chatContact.count({ where }),
      ]);

      return {
        items: contacts,
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    }),

  getContact: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyContactAccess(ctx.auth.user.id, input.id);

      const contact = await prisma.chatContact.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          imageUrl: true,
          stage: true,
          source: true,
          notes: true,
          lastContactedAt: true,
          assignedToId: true,
          workspaceId: true,
          createdAt: true,
          updatedAt: true,
          workspace: {
            select: { id: true, name: true, imageUrl: true },
          },
          assignedTo: {
            select: { id: true, name: true, image: true },
          },
          categories: {
            select: {
              category: {
                select: { id: true, name: true, color: true },
              },
            },
          },
          activities: {
            orderBy: { createdAt: "desc" },
            take: 3,
            select: {
              id: true,
              type: true,
              description: true,
              metadata: true,
              createdAt: true,
            },
          },
          chatRooms: {
            orderBy: { updatedAt: "desc" },
            take: 5,
            select: {
              id: true,
              channel: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!contact) throw new TRPCError({ code: "NOT_FOUND" });

      return contact;
    }),

  createContact: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        firstName: z.string().trim().min(1, "First name is required"),
        lastName: z.string().trim().optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        stage: z.enum(STAGES).default("new_lead"),
        source: z.enum(SOURCES).default("manual"),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify membership
      const member = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.workspaceId,
          },
        },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      // Check for duplicate phone in same workspace
      if (input.phone) {
        const existing = await prisma.chatContact.findFirst({
          where: {
            workspaceId: input.workspaceId,
            phone: input.phone,
          },
        });
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "A contact with this phone number already exists in this location.",
          });
        }
      }

      const contact = await prisma.chatContact.create({
        data: {
          workspaceId: input.workspaceId,
          firstName: input.firstName,
          lastName: input.lastName || null,
          email: input.email || null,
          phone: input.phone || null,
          stage: input.stage,
          source: input.source,
          notes: input.notes || null,
          isContact: true,
        },
      });

      // Log activity
      await logActivity({
        contactId: contact.id,
        workspaceId: input.workspaceId,
        type: "contact_created",
        description: `Contact created by ${ctx.auth.user.name || "team member"}`,
      });

      return contact;
    }),

  promoteToContact: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().trim().min(1),
        lastName: z.string().trim().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        stage: z
          .enum([
            "new_lead",
            "prospecting",
            "appointment",
            "payment",
            "not_a_fit",
            "lost",
          ])
          .default("new_lead"),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyContactAccess(ctx.auth.user.id, input.id);

      const contact = await prisma.chatContact.update({
        where: { id: input.id },
        data: {
          isContact: true,
          firstName: input.firstName,
          lastName: input.lastName || null,
          email: input.email || null,
          phone: input.phone || null,
          stage: input.stage,
          notes: input.notes || null,
          source: "manual",
        },
      });

      await logActivity({
        contactId: contact.id,
        workspaceId: contact.workspaceId,
        type: "contact_created",
        description: "Promoted from conversation to contact",
      });

      return contact;
    }),

  updateContact: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().trim().min(1).optional(),
        lastName: z.string().trim().optional().nullable(),
        email: z.string().email().optional().nullable().or(z.literal("")),
        phone: z.string().optional().nullable(),
        stage: z.enum(STAGES).optional(),
        notes: z.string().optional().nullable(),
        workspaceId: z.string().optional(),
        assignedToId: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Get current contact to check for stage change
      const current = await prisma.chatContact.findUnique({
        where: { id },
        select: { stage: true, workspaceId: true },
      });
      if (!current) throw new TRPCError({ code: "NOT_FOUND" });

      // Auth check
      const member = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: current.workspaceId,
          },
        },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      // Clean empty strings to null
      const cleanData: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          cleanData[key] = value === "" ? null : value;
        }
      }

      const contact = await prisma.chatContact.update({
        where: { id },
        data: cleanData,
      });

      // Log stage change
      if (input.stage && input.stage !== current.stage) {
        await logActivity({
          contactId: id,
          workspaceId: current.workspaceId,
          type: "stage_changed",
          description: `Stage changed from ${current.stage} to ${input.stage}`,
          metadata: {
            from: current.stage,
            to: input.stage,
            changedBy: ctx.auth.user.name || ctx.auth.user.id,
          },
        });
      }

      return contact;
    }),

  deleteContact: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await verifyContactAccess(ctx.auth.user.id, input.id);
      await prisma.chatContact.delete({ where: { id: input.id } });
      return { success: true };
    }),
  getCategories: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const where: any = { workspaceId: input.workspaceId };

      if (input.search) {
        where.name = { contains: input.search, mode: "insensitive" };
      }

      return prisma.category.findMany({
        where,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          color: true,
          _count: {
            select: { contacts: true },
          },
        },
      });
    }),

  createCategory: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        name: z.string().trim().min(1, "Name is required"),
        color: z.string().optional(),
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
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      return prisma.category.create({
        data: {
          workspaceId: input.workspaceId,
          name: input.name,
          color: input.color || null,
        },
      });
    }),

  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await verifyCategoryAccess(ctx.auth.user.id, input.id);
      await prisma.category.delete({ where: { id: input.id } });
      return { success: true };
    }),

  addCategoryToContact: protectedProcedure
    .input(
      z.object({
        contactId: z.string(),
        categoryId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyContactAccess(ctx.auth.user.id, input.contactId);
      return prisma.contactCategory.create({
        data: {
          contactId: input.contactId,
          categoryId: input.categoryId,
        },
      });
    }),

  removeCategoryFromContact: protectedProcedure
    .input(
      z.object({
        contactId: z.string(),
        categoryId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyContactAccess(ctx.auth.user.id, input.contactId);
      await prisma.contactCategory.deleteMany({
        where: {
          contactId: input.contactId,
          categoryId: input.categoryId,
        },
      });
      return { success: true };
    }),
  getActivities: protectedProcedure
    .input(
      z.object({
        contactId: z.string(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      await verifyContactAccess(ctx.auth.user.id, input.contactId);

      const { contactId, page, pageSize } = input;

      const [activities, totalCount] = await Promise.all([
        prisma.activity.findMany({
          where: { contactId },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            type: true,
            description: true,
            metadata: true,
            createdAt: true,
          },
        }),
        prisma.activity.count({ where: { contactId } }),
      ]);

      return {
        items: activities,
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    }),
  batchCreate: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        contacts: z
          .array(
            z.object({
              firstName: z.string().trim().min(1),
              lastName: z.string().trim().optional(),
              email: z.string().email().optional().or(z.literal("")),
              phone: z.string().optional(),
              stage: z.enum(STAGES).default("new_lead"),
              source: z.enum(SOURCES).default("csv"),
              notes: z.string().optional(),
            }),
          )
          .min(1)
          .max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify membership
      const member = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.workspaceId,
          },
        },
      });
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      // Get existing phones in this workspace for dedup
      const existingPhones = new Set(
        (
          await prisma.chatContact.findMany({
            where: {
              workspaceId: input.workspaceId,
              phone: { not: null },
            },
            select: { phone: true },
          })
        ).map((c) => c.phone),
      );

      const toCreate: any[] = [];
      const skipped: string[] = [];

      for (const contact of input.contacts) {
        // Skip if phone already exists in workspace
        if (contact.phone && existingPhones.has(contact.phone)) {
          skipped.push(contact.phone);
          continue;
        }

        toCreate.push({
          workspaceId: input.workspaceId,
          firstName: contact.firstName,
          lastName: contact.lastName || null,
          email: contact.email || null,
          phone: contact.phone || null,
          stage: contact.stage,
          source: contact.source,
          notes: contact.notes || null,
          isContact: true,
        });

        // Track phone so we don't create dupes within the batch itself
        if (contact.phone) {
          existingPhones.add(contact.phone);
        }
      }

      let created = 0;

      if (toCreate.length > 0) {
        // Use transaction to get IDs back
        const newContacts = await prisma.$transaction(
          toCreate.map((data) =>
            prisma.chatContact.create({
              data,
              select: { id: true, workspaceId: true },
            }),
          ),
        );
        created = newContacts.length;

        if (newContacts.length > 0) {
          await prisma.activity.createMany({
            data: newContacts.map((c) => ({
              contactId: c.id,
              workspaceId: c.workspaceId,
              type: "contact_created",
              description: `Imported via ${input.contacts[0]?.source || "csv"}`,
            })),
          });
        }
      }

      return {
        created,
        skipped: skipped.length,
        skippedPhones: skipped,
        total: input.contacts.length,
      };
    }),

  exportContacts: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().optional(),
        stage: z.enum(STAGES).optional(),
        source: z.enum(SOURCES).optional(),
        categoryId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userWorkspaces = await prisma.member.findMany({
        where: { userId: ctx.auth.user.id },
        select: { workspaceId: true },
      });
      const workspaceIds = userWorkspaces.map((m) => m.workspaceId);

      const where: any = {
        isContact: true,
        workspaceId: input.workspaceId
          ? input.workspaceId
          : { in: workspaceIds },
      };

      if (input.stage) where.stage = input.stage;
      if (input.source) where.source = input.source;
      if (input.categoryId) {
        where.categories = { some: { categoryId: input.categoryId } };
      }

      const contacts = await prisma.chatContact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          stage: true,
          source: true,
          notes: true,
          lastContactedAt: true,
          createdAt: true,
          workspace: {
            select: { name: true },
          },
          categories: {
            select: {
              category: {
                select: { name: true },
              },
            },
          },
          _count: {
            select: {
              chatRooms: true,
              activities: true,
            },
          },
        },
      });

      // Flatten for CSV
      return contacts.map((c) => ({
        firstName: c.firstName || "",
        lastName: c.lastName || "",
        email: c.email || "",
        phone: c.phone || "",
        stage: c.stage,
        source: c.source,
        notes: c.notes || "",
        categories: c.categories.map((cc) => cc.category.name).join(", "),
        location: c.workspace?.name || "",
        conversations: c._count.chatRooms,
        totalActivities: c._count.activities,
        lastContacted: c.lastContactedAt?.toISOString() || "",
        created: c.createdAt.toISOString(),
      }));
    }),
});
