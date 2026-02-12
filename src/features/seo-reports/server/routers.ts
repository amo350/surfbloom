import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ReportStatus } from "@/generated/prisma/enums";
import { sendReportGeneration } from "@/inngest/utils";
import {
  visibilityBreakdownSchema,
  reputationBreakdownSchema,
  strengthsSchema,
  weaknessesSchema,
  recommendationsSchema,
  type Strength,
  type Weakness,
  type Recommendation,
} from "../lib/report-schema";

export const seoReportsRouter = createTRPCRouter({
  // Create a new report — finds or creates Location, creates Report, fires Inngest
  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        query: z.string().min(1, "Business name and location is required"),
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

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not a member of this workspace",
        });
      }

      // Create the report
      const report = await prisma.report.create({
        data: {
          workspaceId: input.workspaceId,
          status: ReportStatus.PENDING,
        },
      });

      // Fire Inngest event — async pipeline handles fetching + analysis
      await sendReportGeneration({
        reportId: report.id,
        workspaceId: input.workspaceId,
        query: input.query,
      });

      return { reportId: report.id };
    }),

  // Get a single report by ID
  getOne: protectedProcedure
    .input(
      z.object({
        reportId: z.string(),
        workspaceId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const member = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.workspaceId,
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not a member of this workspace",
        });
      }

      const report = await prisma.report.findFirst({
        where: {
          id: input.reportId,
          workspaceId: input.workspaceId,
        },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
              googleRating: true,
              googleReviewCount: true,
            },
          },
        },
      });

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }

      // Validate JSON fields on read (same pattern as tutorial's getJobById)
      let validatedReport = {
        ...report,
        visibilityBreakdown: null as z.infer<
          typeof visibilityBreakdownSchema
        > | null,
        reputationBreakdown: null as z.infer<
          typeof reputationBreakdownSchema
        > | null,
        strengths: null as Strength[] | null,
        weaknesses: null as Weakness[] | null,
        recommendations: null as Recommendation[] | null,
      };

      if (report.visibilityBreakdown) {
        validatedReport.visibilityBreakdown = visibilityBreakdownSchema.parse(
          report.visibilityBreakdown,
        );
      }
      if (report.reputationBreakdown) {
        validatedReport.reputationBreakdown = reputationBreakdownSchema.parse(
          report.reputationBreakdown,
        );
      }
      if (report.strengths) {
        validatedReport.strengths = report.strengths as Strength[];
      }
      if (report.weaknesses) {
        validatedReport.weaknesses = report.weaknesses as Weakness[];
      }
      if (report.recommendations) {
        validatedReport.recommendations = report.recommendations as Recommendation[];
      }

      return validatedReport;
    }),

  // Get all reports for a workspace
  getByWorkspace: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const member = await prisma.member.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.user.id,
            workspaceId: input.workspaceId,
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not a member of this workspace",
        });
      }

      return prisma.report.findMany({
        where: { workspaceId: input.workspaceId },
        orderBy: { createdAt: "desc" },
      });
    }),

  // All reports across all workspaces for the current user (overview dashboard)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await prisma.member.findMany({
      where: { userId: ctx.auth.user.id },
      select: { workspaceId: true },
    });

    const workspaceIds = memberships.map((m) => m.workspaceId);

    return prisma.report.findMany({
      where: {
        workspaceId: { in: workspaceIds },
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            googleRating: true,
            googleReviewCount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Retry a failed report — smart retry if rawData exists
  retry: protectedProcedure
    .input(
      z.object({
        reportId: z.string(),
        workspaceId: z.string(),
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

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not a member of this workspace",
        });
      }

      const report = await prisma.report.findFirst({
        where: {
          id: input.reportId,
          workspaceId: input.workspaceId,
          status: ReportStatus.FAILED,
        },
        include: { workspace: true },
      });

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Failed report not found",
        });
      }

      const hasRawData = report.rawData !== null;

      // Reset report status
      await prisma.report.update({
        where: { id: report.id },
        data: {
          status: hasRawData ? ReportStatus.ANALYZING : ReportStatus.PENDING,
          error: null,
          completedAt: null,
          // Only clear analysis fields, keep rawData for smart retry
          visibilityScore: null,
          reputationScore: null,
          visibilityBreakdown: undefined, // Prisma: undefined = don't change
          reputationBreakdown: undefined,
          strengths: undefined,
          weaknesses: undefined,
          recommendations: undefined,
          ...(hasRawData
            ? {} // Smart retry: keep rawData
            : { rawData: undefined }), // Full retry: clear everything
        },
      });

      const ws = report.workspace;
      const queryParts = [ws.name];
      if (ws.address) queryParts.push(ws.address);
      if (ws.city) queryParts.push(ws.city);
      if (ws.state) queryParts.push(ws.state);

      await sendReportGeneration({
        reportId: report.id,
        workspaceId: input.workspaceId,
        query: queryParts.join(", "),
        smartRetry: hasRawData,
      });

      return { reportId: report.id, smartRetry: hasRawData };
    }),

  cancel: protectedProcedure
    .input(
      z.object({
        reportId: z.string(),
        workspaceId: z.string(),
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

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not a member of this workspace",
        });
      }

      const report = await prisma.report.findFirst({
        where: {
          id: input.reportId,
          workspaceId: input.workspaceId,
        },
      });

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }

      if (
        report.status === ReportStatus.COMPLETED ||
        report.status === ReportStatus.FAILED
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Report is already completed or failed",
        });
      }

      await prisma.report.update({
        where: { id: report.id },
        data: {
          status: ReportStatus.FAILED,
          error: "Cancelled by user",
          completedAt: new Date(),
        },
      });

      return { reportId: report.id };
    }),
});