// src/app/api/feedback/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/features/contacts/server/log-activity";
import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

const feedbackSubmitSchema = z.object({
  workspaceId: z.string().min(1),
  slug: z.string().min(1).optional(),
  name: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  phone: z.string().trim().optional().nullable(),
  message: z.string().trim().min(1),
  rating: z.number().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = feedbackSubmitSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const {
      workspaceId,
      slug,
      name,
      email: rawEmail,
      phone,
      message,
      rating,
    } = parsed.data;
    const email = rawEmail || null;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        userId: true,
        feedbackSlug: true,
        user: { select: { email: true } },
        domains: {
          select: {
            id: true,
            user: { select: { email: true } },
          },
          take: 1,
        },
        members: {
          where: { role: "ADMIN" },
          select: {
            user: { select: { email: true } },
          },
          take: 3,
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (slug && workspace.feedbackSlug && slug !== workspace.feedbackSlug) {
      return NextResponse.json(
        { error: "Invalid feedback link" },
        { status: 400 },
      );
    }

    let domainId = workspace.domains[0]?.id;
    if (!domainId) {
      const fallbackName = `feedback-${workspace.id.slice(0, 8)}`;
      const existingFallback = await prisma.domain.findFirst({
        where: { userId: workspace.userId, name: fallbackName },
        select: { id: true },
      });

      if (existingFallback) {
        domainId = existingFallback.id;
      } else {
        const fallbackDomain = await prisma.domain.create({
          data: {
            userId: workspace.userId,
            workspaceId,
            name: fallbackName,
          },
          select: { id: true },
        });
        domainId = fallbackDomain.id;
      }
    }

    const contactId = await prisma.$transaction(async (tx) => {
      // 1) Create/find contact
      let contact: { id: string } | null = null;
      if (email || phone) {
        if (email) {
          contact = await tx.chatContact.findFirst({
            where: { workspaceId, email },
          });
        }
        if (!contact && phone) {
          contact = await tx.chatContact.findFirst({
            where: { workspaceId, phone },
          });
        }

        if (!contact) {
          contact = await tx.chatContact.create({
            data: {
              domainId,
              workspaceId,
              email: email || null,
              phone: phone || null,
            },
          });
        }
      }

      // 2) Create conversation + message
      const room = await tx.chatRoom.create({
        data: {
          domainId,
          workspaceId,
          contactId: contact?.id,
          channel: "feedback",
          live: true,
        },
      });

      await tx.chatMessage.create({
        data: {
          chatRoomId: room.id,
          message: [
            "Feedback submitted from /r page",
            name ? `Name: ${name}` : null,
            email ? `Email: ${email}` : null,
            phone ? `Phone: ${phone}` : null,
            "",
            message,
          ]
            .filter(Boolean)
            .join("\n"),
          role: "USER",
        },
      });

      // 3) Track visit event
      await tx.feedbackVisit.create({
        data: {
          workspaceId,
          path: "feedback",
          contactPhone: phone || null,
        },
      });

      // 4) Create follow-up task in first column
      const defaultColumn = await tx.taskColumn.findFirst({
        where: { workspaceId },
        orderBy: { position: "asc" },
        select: { id: true },
      });

      if (defaultColumn) {
        const [lastTask, highestTask] = await Promise.all([
          tx.task.findFirst({
            where: { workspaceId },
            orderBy: { taskNumber: "desc" },
            select: { taskNumber: true },
          }),
          tx.task.findFirst({
            where: { workspaceId, columnId: defaultColumn.id },
            orderBy: { position: "desc" },
            select: { position: true },
          }),
        ]);

        await tx.task.create({
          data: {
            workspaceId,
            columnId: defaultColumn.id,
            name: `Feedback follow-up${name ? `: ${name}` : ""}`,
            description: [
              `Feedback submitted via ${workspace.name} feedback page.`,
              "",
              name ? `Contact: ${name}` : null,
              email ? `Email: ${email}` : null,
              phone ? `Phone: ${phone}` : null,
              "",
              `Message: ${message}`,
            ]
              .filter(Boolean)
              .join("\n"),
            taskNumber: (lastTask?.taskNumber ?? 0) + 1,
            position: (highestTask?.position ?? 0) + 1000,
          },
        });
      }

      return contact?.id ?? null;
    });

    // Log activity
    if (contactId && workspaceId) {
      await logActivity({
        contactId,
        workspaceId,
        type: "feedback_submitted",
        description: `Submitted feedback${message ? `: "${message.slice(0, 60)}${message.length > 60 ? "..." : ""}"` : ""}`,
        metadata: { rating: rating ?? undefined },
      });
    }

    // 5) Email notification to owner/admins
    const notifyEmails = [
      workspace.user.email,
      workspace.domains[0]?.user?.email,
      ...workspace.members.map((m) => m.user.email),
    ].filter(Boolean) as string[];

    const uniqueEmails = [...new Set(notifyEmails)];

    if (uniqueEmails.length > 0) {
      await sendMail({
        to: uniqueEmails.join(", "),
        subject: `New Feedback — ${workspace.name}`,
        text: [
          `Someone submitted feedback for ${workspace.name}.`,
          "",
          name ? `Name: ${name}` : null,
          email ? `Email: ${email}` : null,
          phone ? `Phone: ${phone}` : null,
          "",
          `Message:`,
          message,
          "",
          `A task has been created and the conversation is in your inbox.`,
        ]
          .filter(Boolean)
          .join("\n"),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback submit error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
