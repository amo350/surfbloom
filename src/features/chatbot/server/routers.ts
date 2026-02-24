import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { logActivity } from "@/features/contacts/server/log-activity";
import { prisma } from "@/lib/prisma";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/trpc/init";

const getUserWorkspaceIds = async (userId: string) => {
  const [memberWorkspaces, ownedWorkspaces] = await Promise.all([
    prisma.member.findMany({
      where: { userId },
      select: { workspaceId: true },
    }),
    prisma.workspace.findMany({
      where: { userId },
      select: { id: true },
    }),
  ]);

  return [
    ...new Set([
      ...memberWorkspaces.map((member) => member.workspaceId),
      ...ownedWorkspaces.map((workspace) => workspace.id),
    ]),
  ];
};

const getRoomVisibilityWhere = (userId: string, workspaceIds: string[]) => ({
  OR: [{ domain: { userId } }, { workspaceId: { in: workspaceIds } }],
});

const repairOrphanSmsRooms = async (workspaceIds: string[]) => {
  if (workspaceIds.length === 0) return;

  const orphanSms = await prisma.smsMessage.findMany({
    where: {
      workspaceId: { in: workspaceIds },
      chatRoomId: null,
    },
    select: {
      workspaceId: true,
      direction: true,
      from: true,
      to: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  if (orphanSms.length === 0) return;

  const keys = new Map<string, { workspaceId: string; phone: string }>();
  for (const sms of orphanSms) {
    const phone = sms.direction === "outbound" ? sms.to : sms.from;
    if (!phone) continue;

    const key = `${sms.workspaceId}:${phone}`;
    if (!keys.has(key)) {
      keys.set(key, { workspaceId: sms.workspaceId, phone });
    }
  }

  const targetWorkspaces = [
    ...new Set([...keys.values()].map((x) => x.workspaceId)),
  ];
  const workspaceDomainRows = await prisma.workspace.findMany({
    where: { id: { in: targetWorkspaces } },
    select: {
      id: true,
      domains: {
        select: { id: true },
        take: 1,
      },
    },
  });
  const workspaceDomainMap = new Map(
    workspaceDomainRows.map((workspace) => [
      workspace.id,
      workspace.domains[0]?.id ?? null,
    ]),
  );

  for (const { workspaceId, phone } of keys.values()) {
    await prisma.$transaction(async (tx) => {
      let contact = await tx.chatContact.findFirst({
        where: { workspaceId, phone },
        select: { id: true, domainId: true },
      });

      if (!contact) {
        contact = await tx.chatContact.create({
          data: {
            workspaceId,
            phone,
            domainId: workspaceDomainMap.get(workspaceId) ?? undefined,
          },
          select: { id: true, domainId: true },
        });
      }

      let room = await tx.chatRoom.findFirst({
        where: {
          workspaceId,
          contactId: contact.id,
          channel: "sms",
        },
        select: { id: true },
      });

      if (!room) {
        room = await tx.chatRoom.create({
          data: {
            workspaceId,
            contactId: contact.id,
            domainId:
              contact.domainId ??
              workspaceDomainMap.get(workspaceId) ??
              undefined,
            channel: "sms",
          },
          select: { id: true },
        });
      }

      await tx.smsMessage.updateMany({
        where: {
          workspaceId,
          chatRoomId: null,
          OR: [
            { direction: "inbound", from: phone },
            { direction: "outbound", to: phone },
          ],
        },
        data: { chatRoomId: room.id },
      });

      await tx.chatRoom.update({
        where: { id: room.id },
        data: { updatedAt: new Date() },
      });
    });
  }
};

export const chatbotRouter = createTRPCRouter({
  // ─── Domains ────────────────────────────────────────────
  getDomains: protectedProcedure.query(async ({ ctx }) => {
    return prisma.domain.findMany({
      where: { userId: ctx.auth.user.id },
      include: {
        workspace: {
          select: { id: true, name: true, city: true, state: true },
        },
        chatBot: {
          select: {
            id: true,
            welcomeMessage: true,
            icon: true,
            themeColor: true,
            headerText: true,
            businessContext: true,
            bubbleTransparent: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  addDomain: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .trim()
          .min(3, "Domain must be at least 3 characters")
          .refine(
            (v) => /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,}$/.test(v),
            "Enter a valid domain (e.g. mybusiness.com)",
          ),
        workspaceId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.domain.findUnique({
        where: {
          userId_name: {
            userId: ctx.auth.user.id,
            name: input.name,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This domain is already added",
        });
      }

      return prisma.domain.create({
        data: {
          userId: ctx.auth.user.id,
          name: input.name,
          workspaceId: input.workspaceId,
          chatBot: {
            create: {
              welcomeMessage: "Hey there, how can we help you today?",
            },
          },
          filterQuestions: {
            createMany: {
              data: [
                { question: "Provide Email" },
                { question: "Location Selector" },
              ],
            },
          },
        },
        include: {
          chatBot: true,
        },
      });
    }),

  removeDomain: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const domain = await prisma.domain.findFirst({
        where: { id: input.id, userId: ctx.auth.user.id },
      });
      if (!domain) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Domain not found" });
      }
      await prisma.domain.delete({ where: { id: input.id } });
      return { success: true };
    }),

  updateDomain: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        workspaceId: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const domain = await prisma.domain.findFirst({
        where: { id: input.id, userId: ctx.auth.user.id },
      });
      if (!domain) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Domain not found" });
      }
      return prisma.domain.update({
        where: { id: input.id },
        data: { workspaceId: input.workspaceId },
      });
    }),

  // ─── Chatbot Config ─────────────────────────────────────
  getConfig: protectedProcedure
    .input(z.object({ domainId: z.string() }))
    .query(async ({ ctx, input }) => {
      const domain = await prisma.domain.findFirst({
        where: { id: input.domainId, userId: ctx.auth.user.id },
      });
      if (!domain) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return prisma.chatBot.findUnique({
        where: { domainId: input.domainId },
      });
    }),

  updateConfig: protectedProcedure
    .input(
      z.object({
        domainId: z.string(),
        welcomeMessage: z.string().min(1).optional(),
        icon: z.string().optional().nullable(),
        headerText: z.string().optional(),
        themeColor: z.string().optional(),
        businessContext: z.string().optional(),
        bubbleTransparent: z.boolean().optional(),
        helpdesk: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const domain = await prisma.domain.findFirst({
        where: { id: input.domainId, userId: ctx.auth.user.id },
      });
      if (!domain) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { domainId, ...data } = input;
      return prisma.chatBot.upsert({
        where: { domainId },
        update: data,
        create: { domainId, ...data },
      });
    }),

  // ─── Help Desk ──────────────────────────────────────────
  getHelpDeskItems: protectedProcedure
    .input(z.object({ domainId: z.string() }))
    .query(async ({ ctx, input }) => {
      const domain = await prisma.domain.findFirst({
        where: { id: input.domainId, userId: ctx.auth.user.id },
      });
      if (!domain) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return prisma.helpDeskItem.findMany({
        where: { domainId: input.domainId },
        orderBy: { createdAt: "asc" },
      });
    }),

  createHelpDeskItem: protectedProcedure
    .input(
      z.object({
        domainId: z.string(),
        question: z.string().trim().min(1, "Question is required"),
        answer: z.string().trim().min(1, "Answer is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const domain = await prisma.domain.findFirst({
        where: { id: input.domainId, userId: ctx.auth.user.id },
      });
      if (!domain) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return prisma.helpDeskItem.create({
        data: {
          domainId: input.domainId,
          question: input.question,
          answer: input.answer,
        },
      });
    }),

  deleteHelpDeskItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await prisma.helpDeskItem.findUnique({
        where: { id: input.id },
        include: { domain: { select: { userId: true } } },
      });
      if (!item || item.domain.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await prisma.helpDeskItem.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ─── Filter Questions ───────────────────────────────────
  getFilterQuestions: protectedProcedure
    .input(z.object({ domainId: z.string() }))
    .query(async ({ ctx, input }) => {
      const domain = await prisma.domain.findFirst({
        where: { id: input.domainId, userId: ctx.auth.user.id },
      });
      if (!domain) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return prisma.filterQuestion.findMany({
        where: { domainId: input.domainId },
        orderBy: { createdAt: "asc" },
      });
    }),

  createFilterQuestion: protectedProcedure
    .input(
      z.object({
        domainId: z.string(),
        question: z.string().trim().min(1, "Question is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const domain = await prisma.domain.findFirst({
        where: { id: input.domainId, userId: ctx.auth.user.id },
      });
      if (!domain) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return prisma.filterQuestion.create({
        data: {
          domainId: input.domainId,
          question: input.question,
        },
      });
    }),

  deleteFilterQuestion: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await prisma.filterQuestion.findUnique({
        where: { id: input.id },
        include: { domain: { select: { userId: true } } },
      });
      if (!item || item.domain.userId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await prisma.filterQuestion.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ─── Conversations ──────────────────────────────────────

  getConversations: protectedProcedure
    .input(
      z.object({
        domainId: z.string().optional(),
        workspaceId: z.string().optional(),
        live: z.boolean().optional(),
        tab: z.enum(["unread", "all", "expired", "starred"]).default("all"),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(12),
        channel: z.enum(["all", "webchat", "sms", "feedback"]).default("all"),
        view: z.enum(["all", "mine", "unassigned"]).default("all"),
        stage: z.string().optional(),
        categoryId: z.string().optional(),
        categoryIds: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { page, pageSize, domainId, workspaceId, live, tab } = input;

        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        const workspaceIds = await getUserWorkspaceIds(ctx.auth.user.id);
        await repairOrphanSmsRooms(workspaceIds);

        const where: any = {
          workspaceId: { in: workspaceIds },
          ...(domainId && { domainId }),
          ...(workspaceId && { workspaceId }),
          ...(live !== undefined && { live }),
        };

        // Tab-specific filters
        switch (tab) {
          case "unread":
            where.AND = [
              ...(where.AND ?? []),
              {
                OR: [
                  { messages: { some: { seen: false, role: "USER" } } },
                  {
                    channel: "sms",
                    smsMessages: { some: { direction: "inbound" } },
                  },
                ],
              },
            ];
            break;
          case "expired":
            where.updatedAt = { lt: twoDaysAgo };
            where.live = false;
            break;
          case "starred":
            // TODO: add `starred` boolean to ChatRoom schema when needed
            break;
          case "all":
          default:
            break;
        }

        // Channel filter
        if (input.channel && input.channel !== "all") {
          where.channel = input.channel;
        }

        // View filter (assignment)
        if (input.view === "mine") {
          where.contact = {
            ...where.contact,
            assignedToId: ctx.auth.user.id,
          };
        } else if (input.view === "unassigned") {
          where.contact = {
            ...where.contact,
            assignedToId: null,
          };
        }

        // Stage filter (through contact)
        if (input.stage) {
          where.contact = {
            ...where.contact,
            stage: input.stage,
          };
        }

        // Category filter (through contact)
        const selectedCategoryIds =
          input.categoryIds && input.categoryIds.length > 0
            ? input.categoryIds
            : input.categoryId
              ? [input.categoryId]
              : [];

        if (selectedCategoryIds.length > 0) {
          where.contact = {
            ...where.contact,
            AND: [
              ...(where.contact?.AND ?? []),
              ...selectedCategoryIds.map((categoryId) => ({
                categories: {
                  some: { categoryId },
                },
              })),
            ],
          };
        }

        const [rooms, totalCount] = await Promise.all([
          prisma.chatRoom.findMany({
            where,
            select: {
              id: true,
              live: true,
              channel: true,
              updatedAt: true,
              contact: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  stage: true,
                  assignedToId: true,
                  isContact: true,
                },
              },
              domain: {
                select: { id: true, name: true },
              },
              workspace: {
                select: { id: true, name: true },
              },
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: {
                  id: true,
                  message: true,
                  role: true,
                  seen: true,
                  createdAt: true,
                },
              },
              smsMessages: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: {
                  id: true,
                  body: true,
                  direction: true,
                  createdAt: true,
                },
              },
            },
            orderBy: { updatedAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
          }),
          prisma.chatRoom.count({ where }),
        ]);

        return {
          items: rooms,
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        };
      } catch (error) {
        console.error("[getConversations] Error:", error);
        throw error;
      }
    }),

  getMessages: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { roomId, page, pageSize } = input;
      const workspaceIds = await getUserWorkspaceIds(ctx.auth.user.id);

      const room = await prisma.chatRoom.findFirst({
        where: {
          id: roomId,
          ...getRoomVisibilityWhere(ctx.auth.user.id, workspaceIds),
        },
      });
      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      }

      const [messages, totalCount] = await Promise.all([
        prisma.chatMessage.findMany({
          where: { chatRoomId: roomId },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            message: true,
            role: true,
            seen: true,
            createdAt: true,
          },
        }),
        prisma.chatMessage.count({ where: { chatRoomId: roomId } }),
      ]);

      return {
        items: messages.reverse(),
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    }),

  getSmsMessages: protectedProcedure
    .input(
      z.object({
        chatRoomId: z.string(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { chatRoomId, page, pageSize } = input;
      const workspaceIds = await getUserWorkspaceIds(ctx.auth.user.id);

      const room = await prisma.chatRoom.findFirst({
        where: {
          id: chatRoomId,
          ...getRoomVisibilityWhere(ctx.auth.user.id, workspaceIds),
        },
      });
      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      }

      const [messages, totalCount] = await Promise.all([
        prisma.smsMessage.findMany({
          where: { chatRoomId },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            direction: true,
            from: true,
            to: true,
            body: true,
            mediaUrl: true,
            status: true,
            createdAt: true,
          },
        }),
        prisma.smsMessage.count({ where: { chatRoomId } }),
      ]);

      return {
        items: messages.reverse(),
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    }),

  getRoom: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspaceIds = await getUserWorkspaceIds(ctx.auth.user.id);
      const room = await prisma.chatRoom.findFirst({
        where: {
          id: input.roomId,
          ...getRoomVisibilityWhere(ctx.auth.user.id, workspaceIds),
        },
        select: {
          id: true,
          channel: true,
          live: true,
          workspaceId: true,
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              stage: true,
              assignedToId: true,
              isContact: true,
            },
          },
        },
      });
      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      }
      return room;
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        message: z.string().trim().min(1, "Message cannot be empty"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceIds = await getUserWorkspaceIds(ctx.auth.user.id);
      const room = await prisma.chatRoom.findFirst({
        where: {
          id: input.roomId,
          ...getRoomVisibilityWhere(ctx.auth.user.id, workspaceIds),
        },
      });
      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      }

      const msg = await prisma.chatMessage.create({
        data: {
          chatRoomId: input.roomId,
          message: input.message,
          role: "ASSISTANT",
        },
        select: {
          id: true,
          message: true,
          role: true,
          seen: true,
          createdAt: true,
        },
      });
      await prisma.chatRoom.update({
        where: { id: input.roomId },
        data: { updatedAt: new Date() },
      });

      // TODO: Phase 7 — Inngest Realtime trigger so visitor sees reply live

      return msg;
    }),

  sendSmsReply: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        message: z.string().min(1).max(1600),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceIds = await getUserWorkspaceIds(ctx.auth.user.id);
      const room = await prisma.chatRoom.findFirst({
        where: {
          id: input.roomId,
          ...getRoomVisibilityWhere(ctx.auth.user.id, workspaceIds),
        },
        select: {
          id: true,
          workspaceId: true,
          contact: { select: { id: true, phone: true, optedOut: true } },
          workspace: {
            select: {
              twilioPhoneNumber: {
                select: { phoneNumber: true },
              },
            },
          },
        },
      });

      if (!room) throw new TRPCError({ code: "NOT_FOUND" });

      if (room.contact?.optedOut) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This contact has opted out of messages",
        });
      }

      if (!room.contact?.phone) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No phone number for this contact.",
        });
      }
      if (!room.workspace?.twilioPhoneNumber?.phoneNumber) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No SMS number assigned to this location.",
        });
      }

      const { sendSms } = await import("@/lib/twilio");

      const result = await sendSms({
        userId: ctx.auth.user.id,
        from: room.workspace.twilioPhoneNumber.phoneNumber,
        to: room.contact.phone,
        body: input.message,
      });
      const mappedStatus = (result.status?.toUpperCase() as any) || "QUEUED";

      const smsMessage = await prisma.smsMessage.create({
        data: {
          workspaceId: room.workspaceId!,
          chatRoomId: room.id,
          direction: "outbound",
          from: room.workspace.twilioPhoneNumber.phoneNumber,
          to: room.contact.phone,
          body: input.message,
          twilioSid: result.sid,
          status: mappedStatus,
        },
        select: {
          id: true,
          direction: true,
          from: true,
          to: true,
          body: true,
          status: true,
          createdAt: true,
        },
      });
      await prisma.chatRoom.update({
        where: { id: room.id },
        data: { updatedAt: new Date() },
      });

      try {
        if (room.workspaceId && room.contact?.phone) {
          const chatRoom = await prisma.chatRoom.findUnique({
            where: { id: input.roomId },
            select: { contactId: true },
          });
          if (chatRoom?.contactId) {
            await logActivity({
              contactId: chatRoom.contactId,
              workspaceId: room.workspaceId,
              type: "sms_sent",
              description: `SMS sent: "${input.message.slice(0, 60)}${input.message.length > 60 ? "..." : ""}"`,
              metadata: { to: room.contact.phone, direction: "outbound" },
            });
          }
        }
      } catch {
        // best-effort logging
      }

      return smsMessage;
    }),

  markSeen: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceIds = await getUserWorkspaceIds(ctx.auth.user.id);
      const room = await prisma.chatRoom.findFirst({
        where: {
          id: input.roomId,
          ...getRoomVisibilityWhere(ctx.auth.user.id, workspaceIds),
        },
      });
      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      }

      await prisma.chatMessage.updateMany({
        where: {
          chatRoomId: input.roomId,
          seen: false,
        },
        data: { seen: true },
      });

      return { success: true };
    }),

  updateRoom: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        workspaceId: z.string().optional().nullable(),
        live: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceIds = await getUserWorkspaceIds(ctx.auth.user.id);
      const room = await prisma.chatRoom.findFirst({
        where: {
          id: input.roomId,
          ...getRoomVisibilityWhere(ctx.auth.user.id, workspaceIds),
        },
      });
      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      }

      const { roomId, ...data } = input;
      if (input.workspaceId) {
        const member = await prisma.member.findUnique({
          where: {
            userId_workspaceId: {
              userId: ctx.auth.user.id,
              workspaceId: input.workspaceId,
            },
          },
        });
        if (!member) throw new TRPCError({ code: "FORBIDDEN" });
      }

      return prisma.chatRoom.update({
        where: { id: roomId },
        data,
        select: {
          id: true,
          live: true,
          workspaceId: true,
        },
      });
    }),

  // ─── Public (no auth — for the iframe) ──────────────────
  getPublicConfig: publicProcedure
    .input(z.object({ domainId: z.string() }))
    .query(async ({ input }) => {
      const domain = await prisma.domain.findUnique({
        where: { id: input.domainId },
        include: {
          chatBot: true,
          helpDeskItems: {
            select: { id: true, question: true, answer: true },
            orderBy: { createdAt: "asc" },
          },
          filterQuestions: {
            select: { id: true, question: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });
      if (!domain) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Domain not found" });
      }
      return {
        domainId: domain.id,
        domainName: domain.name,
        chatBot: domain.chatBot,
        helpDeskItems: domain.helpDeskItems,
        filterQuestions: domain.filterQuestions,
      };
    }),
});
