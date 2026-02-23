import { prisma } from "@/lib/prisma";
import { inngest } from "./client";

export const surveyTimeoutCheck = inngest.createFunction(
  {
    id: "survey-timeout-check",
    name: "Survey Timeout Check",
    concurrency: [{ limit: 1 }],
  },
  { cron: "*/30 * * * *" },
  async ({ step }) => {
    const timedOut = await step.run("find-expired-enrollments", async () => {
      return prisma.surveyEnrollment.findMany({
        where: {
          status: "in_progress",
          channel: "sms",
          timeoutAt: { lte: new Date() },
        },
        select: {
          id: true,
          contactId: true,
          workspaceId: true,
          surveyId: true,
        },
        take: 100,
      });
    });

    const optedOut = await step.run("find-opted-out-enrollments", async () => {
      return prisma.surveyEnrollment.findMany({
        where: {
          status: "in_progress",
          channel: "sms",
          contact: { optedOut: true },
        },
        select: {
          id: true,
          contactId: true,
          workspaceId: true,
          surveyId: true,
        },
        take: 100,
      });
    });

    const allToClose = [...timedOut, ...optedOut];
    if (allToClose.length === 0) {
      return { timedOut: 0, optedOut: 0 };
    }

    const uniqueToClose = Array.from(
      new Map(allToClose.map((enrollment) => [enrollment.id, enrollment])).values(),
    );

    await step.run("mark-timed-out", async () => {
      await prisma.surveyEnrollment.updateMany({
        where: {
          id: { in: uniqueToClose.map((enrollment) => enrollment.id) },
        },
        data: {
          status: "timed_out",
          timeoutAt: null,
        },
      });

      await prisma.activity.createMany({
        data: uniqueToClose.map((enrollment) => ({
          contactId: enrollment.contactId,
          workspaceId: enrollment.workspaceId,
          type: "survey_timed_out",
          description: "SMS survey timed out - no response",
        })),
      });
    });

    return {
      timedOut: timedOut.length,
      optedOut: optedOut.length,
      closed: uniqueToClose.length,
    };
  },
);
