import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { Prisma } from "@/generated/prisma/client";

const displayConditionSchema = z.object({
  questionId: z.string().min(1),
  operator: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "in"]),
  value: z.union([z.number(), z.string(), z.array(z.string())]),
});

async function getOwnedSurveyOrThrow(surveyId: string, userId: string) {
  const survey = await prisma.survey.findFirst({
    where: {
      id: surveyId,
      organizationId: userId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!survey) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  return survey;
}

async function getOwnedQuestionOrThrow(questionId: string, userId: string) {
  const question = await prisma.surveyQuestion.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      surveyId: true,
      order: true,
      type: true,
      _count: {
        select: {
          responses: true,
        },
      },
      survey: {
        select: {
          organizationId: true,
          status: true,
        },
      },
    },
  });

  if (!question || question.survey.organizationId !== userId) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  return question;
}

function pickQuestionMeta(q: {
  id: string;
  order: number;
  type: string;
  text: string;
}) {
  return { id: q.id, order: q.order, type: q.type, text: q.text };
}

type TemplateQuestion = {
  sourceQuestionId?: string;
  type: "nps" | "star" | "multiple_choice" | "free_text" | "yes_no";
  text: string;
  required?: boolean;
  options?: string[] | null;
  displayCondition?: unknown;
};

function isTemplateQuestion(value: unknown): value is TemplateQuestion {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  const validTypes = new Set([
    "nps",
    "star",
    "multiple_choice",
    "free_text",
    "yes_no",
  ]);
  return (
    typeof v.type === "string" &&
    validTypes.has(v.type) &&
    typeof v.text === "string"
  );
}

const prismaSurveyTemplate = (prisma as unknown as { surveyTemplate: any }).surveyTemplate;

export const surveyRouter = createTRPCRouter({
  getSurveys: protectedProcedure
    .input(
      z.object({
        status: z.enum(["draft", "active", "archived"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        organizationId: ctx.auth.user.id,
        ...(input.status ? { status: input.status } : {}),
      };

      const surveys = await prisma.survey.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              questions: true,
              enrollments: true,
            },
          },
        },
      });

      if (surveys.length === 0) {
        return [];
      }

      const surveyIds = surveys.map((s) => s.id);

      const enrollmentStats = await prisma.surveyEnrollment.groupBy({
        by: ["surveyId", "status"],
        where: { surveyId: { in: surveyIds } },
        _count: true,
      });

      const avgScores = await prisma.surveyEnrollment.groupBy({
        by: ["surveyId"],
        where: {
          surveyId: { in: surveyIds },
          status: "completed",
          score: { not: null },
        },
        _avg: { score: true },
      });

      const statsMap = new Map<
        string,
        { completed: number; total: number; avgScore: number | null }
      >();

      for (const row of enrollmentStats) {
        const existing = statsMap.get(row.surveyId) || {
          completed: 0,
          total: 0,
          avgScore: null,
        };
        existing.total += row._count;
        if (row.status === "completed") {
          existing.completed = row._count;
        }
        statsMap.set(row.surveyId, existing);
      }

      for (const row of avgScores) {
        const existing = statsMap.get(row.surveyId) || {
          completed: 0,
          total: 0,
          avgScore: null,
        };
        existing.avgScore = row._avg.score;
        statsMap.set(row.surveyId, existing);
      }

      return surveys.map((s) => ({
        ...s,
        stats: statsMap.get(s.id) || { completed: 0, total: 0, avgScore: null },
      }));
    }),

  getSurvey: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const survey = await prisma.survey.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.auth.user.id,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          status: true,
          thankYouMessage: true,
          reviewThreshold: true,
          taskThreshold: true,
          reviewUrl: true,
          taskAssigneeId: true,
          createdAt: true,
          questions: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              order: true,
              type: true,
              text: true,
              required: true,
              options: true,
              displayCondition: true,
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      });

      if (!survey) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return survey;
    }),

  createSurvey: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const maxAttempts = 5;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          return await prisma.survey.create({
            data: {
              organizationId: ctx.auth.user.id,
              name: input.name,
              description: input.description,
              slug: nanoid(10),
              status: "draft",
            },
          });
        } catch (error) {
          const isUniqueSlugCollision =
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002";
          if (!isUniqueSlugCollision || attempt === maxAttempts - 1) {
            throw error;
          }
        }
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to create survey",
      });
    }),

  updateSurvey: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        status: z.enum(["draft", "active", "archived"]).optional(),
        thankYouMessage: z.string().max(500).optional(),
        reviewThreshold: z.number().int().min(1).max(10).optional(),
        taskThreshold: z.number().int().min(1).max(10).optional(),
        reviewUrl: z.string().url().optional().nullable(),
        taskAssigneeId: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await getOwnedSurveyOrThrow(id, ctx.auth.user.id);

      if (data.status === "active") {
        const questionCount = await prisma.surveyQuestion.count({
          where: { surveyId: id },
        });
        if (questionCount < 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Add at least 1 question before activating",
          });
        }
      }

      return prisma.survey.update({
        where: { id },
        data,
      });
    }),

  deleteSurvey: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const survey = await prisma.survey.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.auth.user.id,
        },
        select: { status: true, _count: { select: { enrollments: true } } },
      });

      if (!survey) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (survey._count.enrollments > 0) {
        return prisma.survey.update({
          where: { id: input.id },
          data: { status: "archived" },
        });
      }

      return prisma.survey.delete({ where: { id: input.id } });
    }),

  saveAsTemplate: protectedProcedure
    .input(
      z.object({
        surveyId: z.string(),
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await getOwnedSurveyOrThrow(input.surveyId, ctx.auth.user.id);

      const questions = await prisma.surveyQuestion.findMany({
        where: { surveyId: input.surveyId },
        orderBy: { order: "asc" },
        select: {
          id: true,
          type: true,
          text: true,
          required: true,
          options: true,
          displayCondition: true,
        },
      });

      const serializedQuestions: TemplateQuestion[] = questions.map((q) => ({
        sourceQuestionId: q.id,
        type: q.type as TemplateQuestion["type"],
        text: q.text,
        required: q.required,
        options: Array.isArray(q.options) ? (q.options as string[]) : null,
        displayCondition: q.displayCondition,
      }));

      return prismaSurveyTemplate.create({
        data: {
          createdBy: ctx.auth.user.id,
          name: input.name,
          description: input.description,
          questions: serializedQuestions as unknown as Prisma.JsonArray,
        },
      });
    }),

  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    return prismaSurveyTemplate.findMany({
      where: { createdBy: ctx.auth.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        questions: true,
        createdAt: true,
      },
    });
  }),

  createFromTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        name: z.string().min(1).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const template = await prismaSurveyTemplate.findFirst({
        where: { id: input.templateId, createdBy: ctx.auth.user.id },
      });

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const survey = await prisma.survey.create({
        data: {
          organizationId: ctx.auth.user.id,
          name: input.name,
          slug: nanoid(10),
          status: "draft",
        },
      });

      const questionsRaw: unknown[] = Array.isArray(template.questions)
        ? template.questions
        : [];
      const questions: TemplateQuestion[] = questionsRaw.filter(isTemplateQuestion);

      if (questions.length > 0) {
        const sourceToNewId = new Map<string, string>();
        const createdQuestionIds: string[] = [];

        for (const [index, q] of questions.entries()) {
          const created = await prisma.surveyQuestion.create({
            data: {
              surveyId: survey.id,
              order: index + 1,
              type: q.type,
              text: q.text,
              required: q.required ?? true,
              options:
                q.options == null
                  ? Prisma.JsonNull
                  : (q.options as Prisma.InputJsonValue),
              displayCondition: Prisma.JsonNull,
            },
            select: { id: true },
          });

          createdQuestionIds.push(created.id);
          if (q.sourceQuestionId) {
            sourceToNewId.set(q.sourceQuestionId, created.id);
          }
        }

        for (const [index, q] of questions.entries()) {
          const parsedCondition = displayConditionSchema.safeParse(q.displayCondition);
          if (!parsedCondition.success) continue;

          const mappedQuestionId = sourceToNewId.get(parsedCondition.data.questionId);
          if (!mappedQuestionId) continue;

          await prisma.surveyQuestion.update({
            where: { id: createdQuestionIds[index] },
            data: {
              displayCondition: {
                ...parsedCondition.data,
                questionId: mappedQuestionId,
              } as Prisma.InputJsonValue,
            },
          });
        }
      }

      return survey;
    }),

  deleteTemplate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await prismaSurveyTemplate.findUnique({
        where: { id: input.id },
        select: { createdBy: true },
      });

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (template.createdBy !== ctx.auth.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return prismaSurveyTemplate.delete({ where: { id: input.id } });
    }),

  addQuestion: protectedProcedure
    .input(
      z.object({
        surveyId: z.string(),
        type: z.enum(["nps", "star", "multiple_choice", "free_text", "yes_no"]),
        text: z.string().min(1).max(500),
        required: z.boolean().default(true),
        options: z.array(z.string()).optional(),
        displayCondition: displayConditionSchema.nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const survey = await prisma.survey.findFirst({
        where: {
          id: input.surveyId,
          organizationId: ctx.auth.user.id,
        },
        select: { status: true, _count: { select: { questions: true } } },
      });

      if (!survey) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (survey.status === "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Archive or set to draft before editing questions",
        });
      }
      if (survey._count.questions >= 15) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum 15 questions per survey",
        });
      }
      if (input.type === "multiple_choice" && (!input.options || input.options.length < 2)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Multiple choice questions require at least 2 options",
        });
      }

      return prisma.surveyQuestion.create({
        data: {
          surveyId: input.surveyId,
          order: survey._count.questions + 1,
          type: input.type,
          text: input.text,
          required: input.required,
          options: input.options,
          displayCondition:
            input.displayCondition === undefined
              ? undefined
              : input.displayCondition ?? Prisma.JsonNull,
        },
      });
    }),

  updateQuestion: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        text: z.string().min(1).max(500).optional(),
        type: z
          .enum(["nps", "star", "multiple_choice", "free_text", "yes_no"])
          .optional(),
        required: z.boolean().optional(),
        options: z.array(z.string()).optional().nullable(),
        displayCondition: displayConditionSchema.nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const question = await getOwnedQuestionOrThrow(id, ctx.auth.user.id);
      const effectiveType = data.type ?? question.type;

      if (question.survey.status === "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Archive or set to draft before editing questions",
        });
      }
      if (effectiveType === "multiple_choice" && (!data.options || data.options.length < 2)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Multiple choice questions require at least 2 options",
        });
      }

      return prisma.surveyQuestion.update({
        where: { id },
        data: {
          ...(data.text !== undefined ? { text: data.text } : {}),
          ...(data.type !== undefined ? { type: data.type } : {}),
          ...(data.required !== undefined ? { required: data.required } : {}),
          ...(data.options !== undefined
            ? { options: data.options ?? Prisma.JsonNull }
            : {}),
          ...(data.displayCondition !== undefined
            ? { displayCondition: data.displayCondition ?? Prisma.JsonNull }
            : {}),
        },
      });
    }),

  deleteQuestion: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const question = await getOwnedQuestionOrThrow(input.id, ctx.auth.user.id);

      if (question.survey.status === "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Archive or set to draft before editing questions",
        });
      }
      if (question._count.responses > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "This question already has responses and cannot be deleted. Archive the survey instead.",
        });
      }

      await prisma.$transaction([
        prisma.surveyQuestion.delete({ where: { id: input.id } }),
        prisma.surveyQuestion.updateMany({
          where: {
            surveyId: question.surveyId,
            order: { gt: question.order },
          },
          data: { order: { decrement: 1 } },
        }),
      ]);

      return { success: true };
    }),

  reorderQuestions: protectedProcedure
    .input(
      z.object({
        surveyId: z.string(),
        questionIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const survey = await getOwnedSurveyOrThrow(input.surveyId, ctx.auth.user.id);
      if (survey.status === "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Archive or set to draft before editing questions",
        });
      }

      const uniqueIds = new Set(input.questionIds);
      if (uniqueIds.size !== input.questionIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Duplicate question IDs are not allowed",
        });
      }

      const count = await prisma.surveyQuestion.count({
        where: {
          surveyId: input.surveyId,
          id: { in: input.questionIds },
        },
      });

      if (count !== input.questionIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more questions do not belong to this survey",
        });
      }

      const updates = input.questionIds.map((id, index) =>
        prisma.surveyQuestion.update({
          where: { id },
          data: { order: index + 1 },
        }),
      );

      await prisma.$transaction(updates);
      return { success: true };
    }),

  getResponses: protectedProcedure
    .input(
      z.object({
        surveyId: z.string(),
        status: z.enum(["completed", "in_progress", "timed_out"]).optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      await getOwnedSurveyOrThrow(input.surveyId, ctx.auth.user.id);

      const where = {
        surveyId: input.surveyId,
        ...(input.status ? { status: input.status } : {}),
      };
      const skip = (input.page - 1) * input.limit;

      const [enrollments, total] = await Promise.all([
        prisma.surveyEnrollment.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: input.limit,
          select: {
            id: true,
            status: true,
            score: true,
            npsCategory: true,
            completedAt: true,
            createdAt: true,
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
            workspace: { select: { name: true } },
            responses: {
              select: {
                questionId: true,
                answerText: true,
                answerNumber: true,
                answerChoice: true,
              },
            },
          },
        }),
        prisma.surveyEnrollment.count({ where }),
      ]);

      return { enrollments, total, page: input.page, limit: input.limit };
    }),

  getQuestionBreakdown: protectedProcedure
    .input(z.object({ surveyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await getOwnedSurveyOrThrow(input.surveyId, ctx.auth.user.id);

      const questions = await prisma.surveyQuestion.findMany({
        where: { surveyId: input.surveyId },
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          type: true,
          text: true,
          options: true,
          responses: {
            select: {
              answerText: true,
              answerNumber: true,
              answerChoice: true,
            },
          },
        },
      });

      return questions.map((q) => {
        const responses = q.responses;
        const total = responses.length;

        switch (q.type) {
          case "nps": {
            const buckets = Array.from({ length: 11 }, (_, i) => ({
              value: i,
              count: 0,
              label: String(i),
            }));

            for (const r of responses) {
              if (r.answerNumber != null) {
                const idx = Math.round(Math.max(0, Math.min(10, r.answerNumber)));
                buckets[idx].count++;
              }
            }

            const numericResponses = responses.filter((r) => r.answerNumber != null);
            const avg =
              numericResponses.length > 0
                ? numericResponses.reduce((s, r) => s + (r.answerNumber ?? 0), 0) /
                  numericResponses.length
                : null;

            return {
              ...pickQuestionMeta(q),
              total,
              avg,
              distribution: buckets,
            };
          }

          case "star": {
            const buckets = Array.from({ length: 5 }, (_, i) => ({
              value: i + 1,
              count: 0,
              label: `${i + 1} star${i > 0 ? "s" : ""}`,
            }));

            for (const r of responses) {
              if (r.answerNumber != null) {
                const idx = Math.round(Math.max(1, Math.min(5, r.answerNumber))) - 1;
                buckets[idx].count++;
              }
            }

            const numericResponses = responses.filter((r) => r.answerNumber != null);
            const avg =
              numericResponses.length > 0
                ? numericResponses.reduce((s, r) => s + (r.answerNumber ?? 0), 0) /
                  numericResponses.length
                : null;

            return {
              ...pickQuestionMeta(q),
              total,
              avg,
              distribution: buckets,
            };
          }

          case "multiple_choice": {
            const optionsList = (q.options as string[]) || [];
            const counts = new Map<string, number>();
            for (const opt of optionsList) counts.set(opt, 0);

            for (const r of responses) {
              if (r.answerChoice) {
                counts.set(r.answerChoice, (counts.get(r.answerChoice) || 0) + 1);
              }
            }

            const distribution = optionsList.map((opt) => ({
              value: opt,
              count: counts.get(opt) || 0,
              label: opt,
            }));

            return {
              ...pickQuestionMeta(q),
              total,
              avg: null,
              distribution,
            };
          }

          case "yes_no": {
            let yes = 0;
            let no = 0;
            for (const r of responses) {
              const answer = (r.answerText || r.answerChoice || "").toLowerCase();
              if (answer === "yes" || answer === "y" || answer === "true") yes++;
              else if (answer === "no" || answer === "n" || answer === "false") no++;
            }

            return {
              ...pickQuestionMeta(q),
              total,
              avg: total > 0 ? (yes / total) * 100 : null,
              distribution: [
                { value: "Yes", count: yes, label: "Yes" },
                { value: "No", count: no, label: "No" },
              ],
            };
          }

          case "free_text": {
            const samples = responses
              .filter((r) => r.answerText)
              .slice(0, 10)
              .map((r) => r.answerText!);

            return {
              ...pickQuestionMeta(q),
              total,
              avg: null,
              distribution: [],
              samples,
            };
          }

          default:
            return { ...pickQuestionMeta(q), total, avg: null, distribution: [] };
        }
      });
    }),

  getScoreDistribution: protectedProcedure
    .input(z.object({ surveyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await getOwnedSurveyOrThrow(input.surveyId, ctx.auth.user.id);

      const enrollments = await prisma.surveyEnrollment.findMany({
        where: {
          surveyId: input.surveyId,
          status: "completed",
          score: { not: null },
        },
        select: { score: true },
      });

      const buckets = Array.from({ length: 11 }, (_, i) => ({
        score: i,
        count: 0,
      }));

      for (const e of enrollments) {
        if (e.score != null) {
          const idx = Math.round(Math.max(0, Math.min(10, e.score)));
          buckets[idx].count++;
        }
      }

      return buckets;
    }),

  getSurveyStats: protectedProcedure
    .input(z.object({ surveyId: z.string() }))
    .query(async ({ ctx, input }) => {
      await getOwnedSurveyOrThrow(input.surveyId, ctx.auth.user.id);

      const [statusCounts, avgScore, npsCounts] = await Promise.all([
        prisma.surveyEnrollment.groupBy({
          by: ["status"],
          where: { surveyId: input.surveyId },
          _count: true,
        }),
        prisma.surveyEnrollment.aggregate({
          where: {
            surveyId: input.surveyId,
            status: "completed",
            score: { not: null },
          },
          _avg: { score: true },
          _count: true,
        }),
        prisma.surveyEnrollment.groupBy({
          by: ["npsCategory"],
          where: {
            surveyId: input.surveyId,
            status: "completed",
            npsCategory: { not: null },
          },
          _count: true,
        }),
      ]);

      const statusMap = new Map(statusCounts.map((s) => [s.status, s._count]));
      const npsMap = new Map(npsCounts.map((n) => [n.npsCategory, n._count]));

      const promoters = npsMap.get("promoter") || 0;
      const passives = npsMap.get("passive") || 0;
      const detractors = npsMap.get("detractor") || 0;
      const npsTotal = promoters + passives + detractors;

      return {
        total:
          (statusMap.get("completed") || 0) +
          (statusMap.get("in_progress") || 0) +
          (statusMap.get("pending") || 0) +
          (statusMap.get("timed_out") || 0),
        completed: statusMap.get("completed") || 0,
        inProgress: statusMap.get("in_progress") || 0,
        timedOut: statusMap.get("timed_out") || 0,
        avgScore: avgScore._avg.score,
        responseCount: avgScore._count,
        nps:
          npsTotal > 0
            ? Math.round(((promoters - detractors) / npsTotal) * 100)
            : null,
        promoters,
        passives,
        detractors,
      };
    }),

  getNpsTrend: protectedProcedure
    .input(
      z.object({
        surveyId: z.string().optional(),
        workspaceId: z.string().optional(),
        days: z.number().int().min(14).max(365).default(90),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.surveyId) {
        await getOwnedSurveyOrThrow(input.surveyId, ctx.auth.user.id);
      }

      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const memberships = await prisma.member.findMany({
        where: { userId: ctx.auth.user.id },
        select: { workspaceId: true },
      });
      const memberWorkspaceIds = memberships.map((m) => m.workspaceId);

      if (input.workspaceId && !memberWorkspaceIds.includes(input.workspaceId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this workspace",
        });
      }

      const where: Prisma.SurveyEnrollmentWhereInput = {
        status: "completed",
        npsCategory: { not: null },
        completedAt: { gte: since },
        workspaceId: input.workspaceId
          ? input.workspaceId
          : { in: memberWorkspaceIds },
        ...(input.surveyId ? { surveyId: input.surveyId } : {}),
      };

      const enrollments = await prisma.surveyEnrollment.findMany({
        where,
        select: {
          npsCategory: true,
          completedAt: true,
        },
        orderBy: { completedAt: "asc" },
      });

      const weeks = new Map<
        string,
        { promoters: number; passives: number; detractors: number }
      >();

      for (const enrollment of enrollments) {
        if (!enrollment.completedAt || !enrollment.npsCategory) continue;

        const d = new Date(enrollment.completedAt);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        const weekKey = monday.toISOString().slice(0, 10);

        const bucket = weeks.get(weekKey) || {
          promoters: 0,
          passives: 0,
          detractors: 0,
        };

        if (enrollment.npsCategory === "promoter") bucket.promoters++;
        else if (enrollment.npsCategory === "passive") bucket.passives++;
        else if (enrollment.npsCategory === "detractor") bucket.detractors++;

        weeks.set(weekKey, bucket);
      }

      return Array.from(weeks.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([week, counts]) => {
          const total = counts.promoters + counts.passives + counts.detractors;
          const nps =
            total > 0
              ? Math.round(((counts.promoters - counts.detractors) / total) * 100)
              : 0;

          return {
            week,
            nps,
            responses: total,
            ...counts,
          };
        });
    }),

  getLocationNps: protectedProcedure
    .input(
      z.object({
        surveyId: z.string().optional(),
        days: z.number().int().min(7).max(365).default(90),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.surveyId) {
        await getOwnedSurveyOrThrow(input.surveyId, ctx.auth.user.id);
      }

      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const memberships = await prisma.member.findMany({
        where: { userId: ctx.auth.user.id },
        select: { workspaceId: true },
      });
      const workspaceIds = memberships.map((m) => m.workspaceId);

      const where: Prisma.SurveyEnrollmentWhereInput = {
        status: "completed",
        npsCategory: { not: null },
        completedAt: { gte: since },
        workspaceId: { in: workspaceIds },
        ...(input.surveyId ? { surveyId: input.surveyId } : {}),
      };

      const grouped = await prisma.surveyEnrollment.groupBy({
        by: ["workspaceId", "npsCategory"],
        where,
        _count: true,
      });

      const statsMap = new Map<
        string,
        { promoters: number; passives: number; detractors: number }
      >();

      for (const row of grouped) {
        if (!row.npsCategory) continue;

        const existing = statsMap.get(row.workspaceId) || {
          promoters: 0,
          passives: 0,
          detractors: 0,
        };

        if (row.npsCategory === "promoter") existing.promoters = row._count;
        else if (row.npsCategory === "passive") existing.passives = row._count;
        else if (row.npsCategory === "detractor") existing.detractors = row._count;

        statsMap.set(row.workspaceId, existing);
      }

      const workspaces = await prisma.workspace.findMany({
        where: { id: { in: Array.from(statsMap.keys()) } },
        select: { id: true, name: true },
      });
      const nameMap = new Map(workspaces.map((workspace) => [workspace.id, workspace.name]));

      return Array.from(statsMap.entries())
        .map(([workspaceId, counts]) => {
          const total = counts.promoters + counts.passives + counts.detractors;
          const nps =
            total > 0
              ? Math.round(((counts.promoters - counts.detractors) / total) * 100)
              : 0;

          return {
            workspaceId,
            workspaceName: nameMap.get(workspaceId) || "Unknown",
            nps,
            responses: total,
            ...counts,
          };
        })
        .sort((a, b) => b.nps - a.nps);
    }),

  generateSummary: protectedProcedure
    .input(z.object({ surveyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await getOwnedSurveyOrThrow(input.surveyId, ctx.auth.user.id);

      const freeTextQuestions = await prisma.surveyQuestion.findMany({
        where: { surveyId: input.surveyId, type: "free_text" },
        select: {
          id: true,
          text: true,
          responses: {
            where: {
              answerText: { not: null },
              enrollment: { status: "completed" },
            },
            select: { answerText: true },
            take: 200,
          },
        },
      });

      if (freeTextQuestions.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No free-text questions in this survey",
        });
      }

      const totalResponses = freeTextQuestions.reduce(
        (sum, question) => sum + question.responses.length,
        0,
      );

      if (totalResponses === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No free-text responses to summarize",
        });
      }

      const responseBlocks = freeTextQuestions
        .map((question) => {
          const answers = question.responses
            .map((response) => `- ${response.answerText}`)
            .join("\n");
          return `Question: "${question.text}"\nResponses:\n${answers}`;
        })
        .join("\n\n");

      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic();

      const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system:
          "You are analyzing customer survey responses for a local business. Provide a concise summary (3-5 bullet points) identifying the main themes, common praises, common complaints, and any actionable insights. Be specific - quote patterns, not individual responses. Keep it under 150 words.",
        messages: [
          {
            role: "user",
            content: `Here are ${totalResponses} free-text survey responses:\n\n${responseBlocks}`,
          },
        ],
      });

      const summary = message.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .filter(Boolean)
        .join("\n")
        .trim();

      return { summary, responsesAnalyzed: totalResponses };
    }),
});
