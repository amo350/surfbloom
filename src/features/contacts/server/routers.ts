// src/features/contacts/server/routers.ts

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { fireWorkflowTrigger } from "@/features/nodes/lib/trigger-dispatcher";
import {
  autoEnrollOnContactCreated,
  autoEnrollOnStageChange,
} from "@/features/sequences/server/auto-enroll";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { DEFAULT_STAGES } from "./default-stages";
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

async function validateStage(userId: string, slug?: string) {
  if (!slug) return;
  const exists = await prisma.stage.findFirst({
    where: { userId, slug },
  });
  if (!exists) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid stage: "${slug}"`,
    });
  }
}

const SOURCES = [
  "manual",
  "csv",
  "webhook",
  "chatbot",
  "sms",
  "feedback",
  "review_campaign",
] as const;

const CONTACT_TRIGGER_BATCH_THRESHOLD = 20;

export const contactsRouter = createTRPCRouter({
  getContacts: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().optional(),
        search: z.string().optional(),
        stage: z.string().optional(),
        source: z.enum(SOURCES).optional(),
        categoryId: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.stage) {
        await validateStage(ctx.auth.user.id, input.stage);
      }
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
          optedOut: true,
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
        stage: z.string().default("new_lead"),
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

      await validateStage(ctx.auth.user.id, input.stage);

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

      autoEnrollOnContactCreated(input.workspaceId, contact.id).catch((err) =>
        console.error("Sequence auto-enroll error:", err),
      );
      await fireWorkflowTrigger({
        triggerType: "CONTACT_CREATED",
        payload: {
          workspaceId: input.workspaceId,
          contactId: contact.id,
          source: contact.source,
          stage: contact.stage,
        },
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
        stage: z.string().default("new_lead"),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyContactAccess(ctx.auth.user.id, input.id);
      await validateStage(ctx.auth.user.id, input.stage);

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

      autoEnrollOnContactCreated(contact.workspaceId, contact.id).catch((err) =>
        console.error("Sequence auto-enroll error:", err),
      );
      await fireWorkflowTrigger({
        triggerType: "CONTACT_CREATED",
        payload: {
          workspaceId: contact.workspaceId,
          contactId: contact.id,
          source: contact.source,
          stage: contact.stage,
        },
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
        stage: z.string().optional(),
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

      if (input.stage) {
        await validateStage(ctx.auth.user.id, input.stage);
      }

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

        autoEnrollOnStageChange(current.workspaceId, id, input.stage).catch(
          (err) => console.error("Sequence auto-enroll error:", err),
        );

        await fireWorkflowTrigger({
          triggerType: "STAGE_CHANGED",
          payload: {
            workspaceId: current.workspaceId,
            contactId: id,
            previousStage: current.stage,
            newStage: input.stage,
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
      const contact = await verifyContactAccess(
        ctx.auth.user.id,
        input.contactId,
      );
      const category = await prisma.category.findFirst({
        where: {
          id: input.categoryId,
          workspaceId: contact.workspaceId,
        },
        select: { name: true },
      });
      if (!category) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Category does not belong to this workspace.",
        });
      }

      const created = await prisma.contactCategory.create({
        data: {
          contactId: input.contactId,
          categoryId: input.categoryId,
        },
      });

      await fireWorkflowTrigger({
        triggerType: "CATEGORY_ADDED",
        payload: {
          workspaceId: contact.workspaceId,
          contactId: input.contactId,
          categoryId: input.categoryId,
          categoryName: category.name,
        },
      });

      return created;
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

  getStages: protectedProcedure.query(async ({ ctx }) => {
    let stages = await prisma.stage.findMany({
      where: { userId: ctx.auth.user.id },
      orderBy: { order: "asc" },
    });

    // Auto-seed defaults if user has none
    if (stages.length === 0) {
      await prisma.stage.createMany({
        data: DEFAULT_STAGES.map((s) => ({
          userId: ctx.auth.user.id,
          ...s,
        })),
        skipDuplicates: true,
      });

      stages = await prisma.stage.findMany({
        where: { userId: ctx.auth.user.id },
        orderBy: { order: "asc" },
      });
    }

    return stages;
  }),

  createStage: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(30),
        color: z.string().default("slate"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const count = await prisma.stage.count({
        where: { userId: ctx.auth.user.id },
      });
      if (count >= 7) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum 7 stages allowed",
        });
      }

      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

      const last = await prisma.stage.findFirst({
        where: { userId: ctx.auth.user.id },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      return prisma.stage.create({
        data: {
          userId: ctx.auth.user.id,
          name: input.name.trim(),
          slug,
          color: input.color,
          order: (last?.order ?? -1) + 1,
        },
      });
    }),

  updateStage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1).max(30).optional(),
        color: z.string().optional(),
        order: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.stage.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });
      if (!existing || existing.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { id, ...data } = input;
      if (data.name) {
        (data as any).slug = data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, "");
      }
      return prisma.stage.update({ where: { id }, data });
    }),

  deleteStage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reassignToSlug: z.string().default("new_lead"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const stage = await prisma.stage.findUnique({
        where: { id: input.id },
        select: { slug: true, userId: true },
      });
      if (!stage) throw new TRPCError({ code: "NOT_FOUND" });
      if (stage.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const count = await prisma.stage.count({
        where: { userId: ctx.auth.user.id },
      });
      if (count <= 3) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Minimum 3 stages required",
        });
      }

      // Reassign contacts across ALL workspaces
      const userWorkspaces = await prisma.member.findMany({
        where: { userId: ctx.auth.user.id },
        select: { workspaceId: true },
      });

      await prisma.chatContact.updateMany({
        where: {
          workspaceId: { in: userWorkspaces.map((m) => m.workspaceId) },
          stage: stage.slug,
        },
        data: { stage: input.reassignToSlug },
      });

      return prisma.stage.delete({ where: { id: input.id } });
    }),

  reorderStages: protectedProcedure
    .input(
      z.object({
        stageIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify all stages belong to user
      const owned = await prisma.stage.findMany({
        where: { userId: ctx.auth.user.id, id: { in: input.stageIds } },
        select: { id: true },
      });

      if (owned.length !== input.stageIds.length) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await prisma.$transaction(
        input.stageIds.map((id, i) =>
          prisma.stage.update({
            where: { id },
            data: { order: i },
          }),
        ),
      );
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
              stage: z.string().default("new_lead"),
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

      const uniqueStages = [...new Set(input.contacts.map((c) => c.stage))];
      for (const s of uniqueStages) {
        await validateStage(ctx.auth.user.id, s);
      }

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
      let newContacts: {
        id: string;
        workspaceId: string;
        source: string;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
        phone: string | null;
        stage: string;
      }[] = [];

      if (toCreate.length > 0) {
        // Use transaction to get IDs back
        newContacts = await prisma.$transaction(
          toCreate.map((data) =>
            prisma.chatContact.create({
              data,
              select: {
                id: true,
                workspaceId: true,
                source: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                stage: true,
              },
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

      for (const createdContact of newContacts) {
        autoEnrollOnContactCreated(
          createdContact.workspaceId,
          createdContact.id,
        ).catch((err) => console.error("Sequence auto-enroll error:", err));
      }

      const workflowsSkipped = newContacts.length > CONTACT_TRIGGER_BATCH_THRESHOLD;
      const workflowsSkippedCount = workflowsSkipped ? newContacts.length : 0;

      // Avoid flooding workflow events for very large CSV imports.
      if (!workflowsSkipped) {
        await Promise.allSettled(
          newContacts.map((createdContact) =>
            fireWorkflowTrigger({
              triggerType: "CONTACT_CREATED",
              payload: {
                workspaceId: createdContact.workspaceId,
                contactId: createdContact.id,
                source: createdContact.source,
                stage: createdContact.stage,
              },
            }),
          ),
        );
      } else if (newContacts.length > 0) {
        console.warn(
          `[contacts.batchCreate] Skipped CONTACT_CREATED triggers for ${newContacts.length} contacts (threshold: ${CONTACT_TRIGGER_BATCH_THRESHOLD})`,
        );
      }

      return {
        created,
        skipped: skipped.length,
        skippedPhones: skipped,
        total: input.contacts.length,
        workflowsSkipped,
        workflowsSkippedCount,
      };
    }),

  exportContacts: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().optional(),
        stage: z.string().optional(),
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

  getDuplicates: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userWorkspaces = await prisma.member.findMany({
        where: { userId: ctx.auth.user.id },
        select: { workspaceId: true },
      });
      const workspaceIds = input.workspaceId
        ? [input.workspaceId]
        : userWorkspaces.map((m) => m.workspaceId);

      // Find contacts with duplicate phones
      const phoneDupes = await prisma.$queryRaw<
        { phone: string; ids: string[]; count: number }[]
      >`
        SELECT phone, array_agg(id) as ids, count(*)::int as count
        FROM "chat_contact"
        WHERE "workspaceId" = ANY(${workspaceIds})
          AND "isContact" = true
          AND phone IS NOT NULL
          AND phone != ''
        GROUP BY phone
        HAVING count(*) > 1
        LIMIT 50
      `;

      // Find contacts with duplicate emails
      const emailDupes = await prisma.$queryRaw<
        { email: string; ids: string[]; count: number }[]
      >`
        SELECT email, array_agg(id) as ids, count(*)::int as count
        FROM "chat_contact"
        WHERE "workspaceId" = ANY(${workspaceIds})
          AND "isContact" = true
          AND email IS NOT NULL
          AND email != ''
        GROUP BY email
        HAVING count(*) > 1
        LIMIT 50
      `;

      // Collect all unique contact IDs
      const allIds = new Set<string>();
      for (const d of [...phoneDupes, ...emailDupes]) {
        for (const id of d.ids) allIds.add(id);
      }

      if (allIds.size === 0) return { groups: [] };

      const contacts = await prisma.chatContact.findMany({
        where: { id: { in: Array.from(allIds) } },
        include: {
          workspace: { select: { name: true } },
          _count: { select: { chatRooms: true, activities: true } },
        },
      });

      const contactMap = new Map(contacts.map((c) => [c.id, c]));

      // Build groups, dedup by sorted ID set
      const seen = new Set<string>();
      const groups: {
        matchField: string;
        matchValue: string;
        contacts: typeof contacts;
      }[] = [];

      for (const d of phoneDupes) {
        const key = d.ids.sort().join(",");
        if (seen.has(key)) continue;
        seen.add(key);
        groups.push({
          matchField: "phone",
          matchValue: d.phone,
          contacts: d.ids
            .map((id) => contactMap.get(id))
            .filter(Boolean) as typeof contacts,
        });
      }

      for (const d of emailDupes) {
        const key = d.ids.sort().join(",");
        if (seen.has(key)) continue;
        seen.add(key);
        groups.push({
          matchField: "email",
          matchValue: d.email,
          contacts: d.ids
            .map((id) => contactMap.get(id))
            .filter(Boolean) as typeof contacts,
        });
      }

      return { groups };
    }),

  mergeContacts: protectedProcedure
    .input(
      z.object({
        keepId: z.string(),
        mergeIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { keepId } = input;
      const mergeIds = input.mergeIds.filter((id) => id !== keepId);

      if (mergeIds.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No valid contacts to merge",
        });
      }

      // Verify access to all contacts
      await verifyContactAccess(ctx.auth.user.id, keepId);
      for (const id of mergeIds) {
        await verifyContactAccess(ctx.auth.user.id, id);
      }

      // Get all contacts
      const keep = await prisma.chatContact.findUnique({
        where: { id: keepId },
        include: { categories: true },
      });
      if (!keep) throw new TRPCError({ code: "NOT_FOUND" });

      const merging = await prisma.chatContact.findMany({
        where: { id: { in: mergeIds } },
        include: { categories: true },
      });

      // Merge data — fill gaps in keeper from merge contacts
      const merged = {
        firstName:
          keep.firstName || merging.find((m) => m.firstName)?.firstName,
        lastName: keep.lastName || merging.find((m) => m.lastName)?.lastName,
        email: keep.email || merging.find((m) => m.email)?.email,
        phone: keep.phone || merging.find((m) => m.phone)?.phone,
        notes:
          [keep.notes, ...merging.map((m) => m.notes)]
            .filter(Boolean)
            .join("\n---\n") || null,
      };

      // Transfer all related records to keeper
      await prisma.$transaction([
        // Update keeper with merged data
        prisma.chatContact.update({
          where: { id: keepId },
          data: merged,
        }),

        // Move conversations
        prisma.chatRoom.updateMany({
          where: { contactId: { in: mergeIds } },
          data: { contactId: keepId },
        }),

        // Move activities
        prisma.activity.updateMany({
          where: { contactId: { in: mergeIds } },
          data: { contactId: keepId },
        }),

        // Move categories (ignore conflicts)
        ...merging
          .flatMap((m) => m.categories)
          .filter(
            (cc) =>
              !keep.categories.some((kc) => kc.categoryId === cc.categoryId),
          )
          .map((cc) =>
            prisma.contactCategory.create({
              data: { contactId: keepId, categoryId: cc.categoryId },
            }),
          ),

        // Delete category links for merge contacts
        prisma.contactCategory.deleteMany({
          where: { contactId: { in: mergeIds } },
        }),

        // Delete merged contacts
        prisma.chatContact.deleteMany({
          where: { id: { in: mergeIds } },
        }),
      ]);

      // Log
      await logActivity({
        contactId: keepId,
        workspaceId: keep.workspaceId,
        type: "contact_updated",
        description: `Merged ${mergeIds.length} duplicate contact${mergeIds.length > 1 ? "s" : ""}`,
      });

      return { success: true, mergedCount: mergeIds.length };
    }),
});
