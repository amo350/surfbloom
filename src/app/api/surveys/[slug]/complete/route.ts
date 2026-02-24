import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fireWorkflowTrigger } from "@/features/nodes/lib/trigger-dispatcher";
import { prisma } from "@/lib/prisma";

const completeBodySchema = z.object({
  enrollmentId: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const parsed = completeBodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const enrollment = await prisma.surveyEnrollment.findUnique({
    where: { id: parsed.data.enrollmentId },
    include: {
      responses: {
        include: {
          question: true,
        },
      },
      survey: true,
      contact: true,
    },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (enrollment.survey.slug !== slug) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let score: number | null = enrollment.score;
  let npsCategory: string | null = enrollment.npsCategory;
  let didComplete = false;

  if (enrollment.status !== "completed") {
    const npsResponse = enrollment.responses.find(
      (r) => r.question.type === "nps",
    );
    if (npsResponse?.answerNumber != null) {
      score = npsResponse.answerNumber;
    } else {
      const numericResponses = enrollment.responses.filter(
        (r) => r.answerNumber != null,
      );
      if (numericResponses.length > 0) {
        score =
          numericResponses.reduce((sum, r) => sum + (r.answerNumber ?? 0), 0) /
          numericResponses.length;
      } else {
        score = null;
      }
    }

    if (score != null) {
      const npsScore = npsResponse ? score : Math.round(score * 2);
      if (npsScore >= 9) npsCategory = "promoter";
      else if (npsScore >= 7) npsCategory = "passive";
      else npsCategory = "detractor";
    } else {
      npsCategory = null;
    }

    const completionUpdate = await prisma.surveyEnrollment.updateMany({
      where: {
        id: enrollment.id,
        status: { not: "completed" },
      },
      data: {
        status: "completed",
        score,
        npsCategory,
        completedAt: new Date(),
      },
    });
    didComplete = completionUpdate.count > 0;
  }

  if (didComplete) {
    if (score != null && score <= enrollment.survey.taskThreshold) {
      const contactName =
        [enrollment.contact.firstName, enrollment.contact.lastName]
          .filter(Boolean)
          .join(" ") ||
        enrollment.contact.phone ||
        "Unknown";

      const responseSummary = enrollment.responses
        .map((r) => {
          const answer =
            r.answerNumber ?? r.answerChoice ?? r.answerText ?? "-";
          return `${r.question.text}: ${answer}`;
        })
        .join("\n");

      await prisma
        .$transaction(async (tx) => {
          const defaultColumn = await tx.taskColumn.findFirst({
            where: { workspaceId: enrollment.workspaceId },
            orderBy: { position: "asc" },
            select: { id: true },
          });

          if (!defaultColumn) {
            return;
          }

          const [lastTask, highestTask] = await Promise.all([
            tx.task.findFirst({
              where: { workspaceId: enrollment.workspaceId },
              orderBy: { taskNumber: "desc" },
              select: { taskNumber: true },
            }),
            tx.task.findFirst({
              where: {
                workspaceId: enrollment.workspaceId,
                columnId: defaultColumn.id,
              },
              orderBy: { position: "desc" },
              select: { position: true },
            }),
          ]);

          await tx.task.create({
            data: {
              workspaceId: enrollment.workspaceId,
              columnId: defaultColumn.id,
              name: `Low survey score from ${contactName}${score != null ? ` (${score.toFixed(1)}/10)` : ""}`,
              description: [
                `Survey: ${enrollment.survey.name}`,
                score != null ? `Score: ${score.toFixed(1)}/10` : null,
                "",
                "Responses:",
                responseSummary || "-",
              ]
                .filter(Boolean)
                .join("\n"),
              taskNumber: (lastTask?.taskNumber ?? 0) + 1,
              position: (highestTask?.position ?? 0) + 1000,
              assigneeId: enrollment.survey.taskAssigneeId || null,
              contactId: enrollment.contactId,
            },
          });
        })
        .catch(() => {});
    }

    await prisma.activity
      .create({
        data: {
          contactId: enrollment.contactId,
          workspaceId: enrollment.workspaceId,
          type: "survey_completed",
          description: `Completed survey: ${enrollment.survey.name}${score != null ? ` - Score: ${score.toFixed(1)}/10` : ""}`,
        },
      })
      .catch(() => {});

    fireWorkflowTrigger({
      triggerType: "SURVEY_COMPLETED",
      payload: {
        workspaceId: enrollment.workspaceId,
        contactId: enrollment.contactId,
        surveyId: enrollment.surveyId,
        score,
        npsCategory,
        channel: enrollment.channel,
      },
    }).catch(() => {});
  }

  let reviewRedirect: string | null = null;
  if (
    score != null &&
    score >= enrollment.survey.reviewThreshold &&
    enrollment.survey.reviewUrl
  ) {
    reviewRedirect = enrollment.survey.reviewUrl;
  }

  return NextResponse.json({
    success: true,
    score,
    npsCategory,
    reviewRedirect,
  });
}
