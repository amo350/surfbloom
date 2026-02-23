import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const respondBodySchema = z.object({
  contactId: z.string().min(1),
  workspaceId: z.string().min(1),
  campaignId: z.string().optional().nullable(),
  questionId: z.string().min(1),
  answerText: z.string().optional().nullable(),
  answerNumber: z.number().optional().nullable(),
  answerChoice: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const workspaceId = req.nextUrl.searchParams.get("w");

  const survey = await prisma.survey.findFirst({
    where: { slug, status: "active" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      thankYouMessage: true,
      reviewThreshold: true,
      taskThreshold: true,
      reviewUrl: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          type: true,
          text: true,
          required: true,
          options: true,
        },
      },
    },
  });

  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  const workspace = workspaceId
    ? await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      })
    : null;

  return NextResponse.json({ survey, workspace });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const parsed = respondBodySchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const body = parsed.data;

  const survey = await prisma.survey.findFirst({
    where: { slug, status: "active" },
    select: {
      id: true,
      status: true,
      questions: {
        where: { id: body.questionId },
        select: { id: true },
      },
    },
  });

  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  if (survey.questions.length === 0) {
    return NextResponse.json(
      { error: "Question does not belong to this survey" },
      { status: 400 },
    );
  }

  const [contact, workspace] = await Promise.all([
    prisma.chatContact.findUnique({
      where: { id: body.contactId },
      select: { id: true, workspaceId: true },
    }),
    prisma.workspace.findUnique({
      where: { id: body.workspaceId },
      select: { id: true },
    }),
  ]);

  if (!contact || !workspace || contact.workspaceId !== body.workspaceId) {
    return NextResponse.json({ error: "Invalid survey link" }, { status: 400 });
  }

  const enrollment = await prisma.$transaction(async (tx) => {
    const upsertResponse = async (enrollmentId: string) => {
      await tx.surveyResponse.upsert({
        where: {
          enrollmentId_questionId: {
            enrollmentId,
            questionId: body.questionId,
          },
        },
        create: {
          enrollmentId,
          questionId: body.questionId,
          answerText: body.answerText,
          answerNumber: body.answerNumber,
          answerChoice: body.answerChoice,
        },
        update: {
          answerText: body.answerText,
          answerNumber: body.answerNumber,
          answerChoice: body.answerChoice,
        },
      });
    };

    if (body.campaignId) {
      const enrollmentRow = await tx.surveyEnrollment.upsert({
        where: {
          surveyId_contactId_campaignId: {
            surveyId: survey.id,
            contactId: body.contactId,
            campaignId: body.campaignId,
          },
        },
        create: {
          surveyId: survey.id,
          contactId: body.contactId,
          workspaceId: body.workspaceId,
          campaignId: body.campaignId,
          status: "in_progress",
        },
        update: {
          status: "in_progress",
        },
      });
      await upsertResponse(enrollmentRow.id);
      return enrollmentRow;
    }

    const existing = await tx.surveyEnrollment.findFirst({
      where: {
        surveyId: survey.id,
        contactId: body.contactId,
        campaignId: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      const enrollmentRow = await tx.surveyEnrollment.update({
        where: { id: existing.id },
        data: { status: "in_progress" },
      });
      await upsertResponse(enrollmentRow.id);
      return enrollmentRow;
    }

    const enrollmentRow = await tx.surveyEnrollment.create({
      data: {
        surveyId: survey.id,
        contactId: body.contactId,
        workspaceId: body.workspaceId,
        campaignId: null,
        status: "in_progress",
      },
    });
    await upsertResponse(enrollmentRow.id);
    return enrollmentRow;
  });

  return NextResponse.json({ success: true, enrollmentId: enrollment.id });
}
