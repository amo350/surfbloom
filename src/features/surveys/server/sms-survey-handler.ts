import { fireWorkflowTrigger } from "@/features/nodes/lib/trigger-dispatcher";
import {
  evaluateDisplayCondition,
  parseDisplayCondition,
} from "@/features/surveys/shared/display-conditions";
import { prisma } from "@/lib/prisma";

interface SurveyHandlerResult {
  handled: boolean;
  replyMessage?: string;
  completed?: boolean;
}

interface ParseResult {
  valid: boolean;
  answerText?: string;
  answerNumber?: number;
  answerChoice?: string;
  nudgeMessage?: string;
}

type SurveyQuestionForFlow = {
  id: string;
  order: number;
  type: string;
  text: string;
  options: unknown;
  displayCondition?: unknown;
};

type SurveyResponseForFlow = {
  questionId: string;
  answerText: string | null;
  answerNumber: number | null;
  answerChoice: string | null;
};

const MAX_RETRIES = 2;
const DEFAULT_TIMEOUT_HOURS = 72;

export async function handleSurveyResponse(
  workspaceId: string,
  contactId: string,
  messageBody: string,
): Promise<SurveyHandlerResult> {
  const enrollment = await prisma.surveyEnrollment.findFirst({
    where: {
      contactId,
      workspaceId,
      channel: "sms",
      status: "in_progress",
    },
    include: {
      survey: {
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
        },
      },
      responses: {
        select: {
          questionId: true,
          answerText: true,
          answerNumber: true,
          answerChoice: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!enrollment) {
    return { handled: false };
  }

  const questions = enrollment.survey.questions;
  if (enrollment.survey.status !== "active") {
    return { handled: false };
  }

  if (questions.length === 0) {
    return { handled: true };
  }

  if (enrollment.currentStep <= 0) {
    const firstQuestion = getNextDisplayableQuestion(
      questions,
      0,
      enrollment.responses,
    );
    if (!firstQuestion) {
      return completeSurvey(enrollment.id);
    }

    const timeoutAt = new Date(
      Date.now() + DEFAULT_TIMEOUT_HOURS * 60 * 60 * 1000,
    );

    await prisma.surveyEnrollment.update({
      where: { id: enrollment.id },
      data: {
        currentStep: firstQuestion.order,
        lastMessageAt: new Date(),
        timeoutAt,
      },
    });

    return {
      handled: true,
      replyMessage: formatQuestionAsSms(firstQuestion, questions.length),
    };
  }

  const currentQuestion = questions.find(
    (q) => q.order === enrollment.currentStep,
  );
  if (!currentQuestion) {
    return advanceToNextQuestion(
      enrollment.id,
      questions,
      enrollment.currentStep,
      enrollment.responses,
    );
  }
  if (!shouldShowQuestion(currentQuestion, enrollment.responses)) {
    return advanceToNextQuestion(
      enrollment.id,
      questions,
      enrollment.currentStep,
      enrollment.responses,
    );
  }

  const parsed = parseResponse((messageBody || "").trim(), currentQuestion);
  if (!parsed.valid) {
    const retryCount = enrollment.retryCount + 1;
    if (retryCount > MAX_RETRIES) {
      await prisma.surveyEnrollment.update({
        where: { id: enrollment.id },
        data: { retryCount: 0 },
      });

      return advanceToNextQuestion(
        enrollment.id,
        questions,
        enrollment.currentStep,
        enrollment.responses,
      );
    }

    await prisma.surveyEnrollment.update({
      where: { id: enrollment.id },
      data: {
        retryCount,
        lastMessageAt: new Date(),
      },
    });

    return {
      handled: true,
      replyMessage: parsed.nudgeMessage,
    };
  }

  await prisma.surveyResponse.upsert({
    where: {
      enrollmentId_questionId: {
        enrollmentId: enrollment.id,
        questionId: currentQuestion.id,
      },
    },
    create: {
      enrollmentId: enrollment.id,
      questionId: currentQuestion.id,
      answerText: parsed.answerText,
      answerNumber: parsed.answerNumber,
      answerChoice: parsed.answerChoice,
    },
    update: {
      answerText: parsed.answerText,
      answerNumber: parsed.answerNumber,
      answerChoice: parsed.answerChoice,
    },
  });

  await prisma.surveyEnrollment.update({
    where: { id: enrollment.id },
    data: {
      retryCount: 0,
      lastMessageAt: new Date(),
    },
  });

  const responses = await prisma.surveyResponse.findMany({
    where: { enrollmentId: enrollment.id },
    select: {
      questionId: true,
      answerText: true,
      answerNumber: true,
      answerChoice: true,
    },
  });

  return advanceToNextQuestion(
    enrollment.id,
    questions,
    enrollment.currentStep,
    responses,
  );
}

async function advanceToNextQuestion(
  enrollmentId: string,
  questions: SurveyQuestionForFlow[],
  currentStep: number,
  responses: SurveyResponseForFlow[],
): Promise<SurveyHandlerResult> {
  const nextQuestion = getNextDisplayableQuestion(
    questions,
    currentStep,
    responses,
  );

  if (!nextQuestion) {
    return completeSurvey(enrollmentId);
  }

  const timeoutAt = new Date(
    Date.now() + DEFAULT_TIMEOUT_HOURS * 60 * 60 * 1000,
  );
  await prisma.surveyEnrollment.update({
    where: { id: enrollmentId },
    data: {
      currentStep: nextQuestion.order,
      lastMessageAt: new Date(),
      timeoutAt,
    },
  });

  return {
    handled: true,
    replyMessage: formatQuestionAsSms(nextQuestion, questions.length),
  };
}

function getNextDisplayableQuestion(
  questions: SurveyQuestionForFlow[],
  currentStep: number,
  responses: SurveyResponseForFlow[],
): SurveyQuestionForFlow | null {
  return (
    [...questions]
      .filter((q) => q.order > currentStep)
      .sort((a, b) => a.order - b.order)
      .find((q) => shouldShowQuestion(q, responses)) || null
  );
}

function shouldShowQuestion(
  question: { displayCondition?: unknown } & Record<string, unknown>,
  responses: SurveyResponseForFlow[],
): boolean {
  const condition = parseDisplayCondition(question.displayCondition);
  if (!condition) return true;

  const response = responses.find((r) => r.questionId === condition.questionId);
  if (!response) return false;

  return evaluateDisplayCondition(condition, {
    answerNumber: response.answerNumber,
    answerChoice: response.answerChoice,
    answerText: response.answerText,
  });
}

function parseResponse(
  body: string,
  question: { type: string; options: unknown },
): ParseResult {
  const normalized = body.toLowerCase().trim();

  switch (question.type) {
    case "nps": {
      const num = parseInt(body, 10);
      if (Number.isNaN(num) || num < 0 || num > 10) {
        return {
          valid: false,
          nudgeMessage: "Please reply with a number from 0 to 10.",
        };
      }
      return { valid: true, answerNumber: num };
    }
    case "star": {
      const num = parseInt(body, 10);
      if (Number.isNaN(num) || num < 1 || num > 5) {
        return {
          valid: false,
          nudgeMessage: "Please reply with a number from 1 to 5.",
        };
      }
      return { valid: true, answerNumber: num };
    }
    case "multiple_choice": {
      const options = Array.isArray(question.options)
        ? (question.options as string[])
        : [];
      const letterIndex = normalized.charCodeAt(0) - 97;
      if (
        normalized.length === 1 &&
        letterIndex >= 0 &&
        letterIndex < options.length
      ) {
        return { valid: true, answerChoice: options[letterIndex] };
      }

      const numIndex = parseInt(body, 10) - 1;
      if (
        !Number.isNaN(numIndex) &&
        numIndex >= 0 &&
        numIndex < options.length
      ) {
        return { valid: true, answerChoice: options[numIndex] };
      }

      const exactMatch = options.find(
        (opt) => opt.toLowerCase() === normalized,
      );
      if (exactMatch) {
        return { valid: true, answerChoice: exactMatch };
      }

      const optionsList = options
        .map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`)
        .join("\n");
      return {
        valid: false,
        nudgeMessage: optionsList
          ? `Please reply with a letter:\n${optionsList}`
          : "Please reply with one of the provided options.",
      };
    }
    case "yes_no": {
      if (["yes", "y", "yeah", "yep", "yup", "si", "1"].includes(normalized)) {
        return { valid: true, answerText: "Yes", answerNumber: 10 };
      }
      if (["no", "n", "nah", "nope", "0"].includes(normalized)) {
        return { valid: true, answerText: "No", answerNumber: 0 };
      }
      return {
        valid: false,
        nudgeMessage: "Please reply Yes or No.",
      };
    }
    case "free_text": {
      if (body.trim().length === 0) {
        return {
          valid: false,
          nudgeMessage: "Please type your response.",
        };
      }
      return { valid: true, answerText: body.trim() };
    }
    default:
      return { valid: true, answerText: body.trim() };
  }
}

function formatQuestionAsSms(
  question: { order: number; text: string; type: string; options: unknown },
  totalQuestions: number,
): string {
  const prefix = `(${question.order}/${totalQuestions}) `;
  let text = `${prefix}${question.text}`;

  switch (question.type) {
    case "nps":
      text += "\n\nReply 0-10";
      break;
    case "star":
      text += "\n\nReply 1-5";
      break;
    case "multiple_choice": {
      const options = Array.isArray(question.options)
        ? (question.options as string[])
        : [];
      if (options.length > 0) {
        const formatted = options
          .map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`)
          .join("\n");
        text += `\n\n${formatted}`;
      }
      break;
    }
    case "yes_no":
      text += "\n\nReply Yes or No";
      break;
  }

  return text;
}

async function completeSurvey(
  enrollmentId: string,
): Promise<SurveyHandlerResult> {
  const enrollment = await prisma.surveyEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      survey: true,
      contact: true,
      responses: {
        include: { question: true },
      },
    },
  });

  if (!enrollment) {
    return { handled: true };
  }

  let score: number | null = null;
  let npsCategory: string | null = null;

  const npsResponse = enrollment.responses.find(
    (r) => r.question.type === "nps",
  );
  if (npsResponse?.answerNumber != null) {
    score = npsResponse.answerNumber;
  } else {
    const numeric = enrollment.responses.filter((r) => r.answerNumber != null);
    if (numeric.length > 0) {
      score =
        numeric.reduce((sum, r) => sum + (r.answerNumber ?? 0), 0) /
        numeric.length;
    }
  }

  if (score != null) {
    const npsScore = npsResponse ? score : Math.round(score * 2);
    if (npsScore >= 9) npsCategory = "promoter";
    else if (npsScore >= 7) npsCategory = "passive";
    else npsCategory = "detractor";
  }

  await prisma.surveyEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status: "completed",
      score,
      npsCategory,
      completedAt: new Date(),
      timeoutAt: null,
    },
  });

  if (score != null && score <= enrollment.survey.taskThreshold) {
    const contactName =
      [enrollment.contact.firstName, enrollment.contact.lastName]
        .filter(Boolean)
        .join(" ") ||
      enrollment.contact.phone ||
      "Unknown";

    const responseSummary = enrollment.responses
      .map((r) => {
        const answer = r.answerNumber ?? r.answerChoice ?? r.answerText ?? "-";
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
              "Channel: SMS",
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
        description: `Completed SMS survey: ${enrollment.survey.name}${score != null ? ` - Score: ${score.toFixed(1)}/10` : ""}`,
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

  let replyMessage: string;
  if (
    score != null &&
    score >= enrollment.survey.reviewThreshold &&
    enrollment.survey.reviewUrl
  ) {
    replyMessage = `Thank you for your feedback! We'd love a review: ${enrollment.survey.reviewUrl}`;
  } else if (score != null && score <= enrollment.survey.taskThreshold) {
    replyMessage =
      "Thank you for your feedback. Our team will follow up with you shortly.";
  } else {
    replyMessage =
      enrollment.survey.thankYouMessage || "Thank you for your feedback!";
  }

  return {
    handled: true,
    replyMessage,
    completed: true,
  };
}
