import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { Prisma } from "@/generated/prisma/client";

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

  addQuestion: protectedProcedure
    .input(
      z.object({
        surveyId: z.string(),
        type: z.enum(["nps", "star", "multiple_choice", "free_text", "yes_no"]),
        text: z.string().min(1).max(500),
        required: z.boolean().default(true),
        options: z.array(z.string()).optional(),
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
});
