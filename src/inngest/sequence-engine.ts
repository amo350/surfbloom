import { prisma } from "@/lib/prisma";
import { inngest } from "./client";
import { executeSequenceStep } from "./sequence-step-executor";

const BATCH_SIZE = 50;
const MAX_BATCHES_PER_RUN = 10;

export const processSequenceSteps = inngest.createFunction(
  {
    id: "process-sequence-steps",
    name: "Process Sequence Steps",
    concurrency: [{ limit: 1 }],
  },
  { cron: "* * * * *" },
  async ({ step }) => {
    let totalProcessed = 0;
    let batchCount = 0;

    while (batchCount < MAX_BATCHES_PER_RUN) {
      const processed = await step.run(`process-batch-${batchCount}`, async () => {
        const dueEnrollments = await prisma.campaignSequenceEnrollment.findMany({
          where: {
            status: "active",
            nextStepAt: { lte: new Date() },
          },
          take: BATCH_SIZE,
          orderBy: { nextStepAt: "asc" },
          select: {
            id: true,
            sequenceId: true,
            contactId: true,
            currentStep: true,
            sequence: {
              select: {
                id: true,
                status: true,
                workspaceId: true,
                steps: {
                  orderBy: { order: "asc" },
                  select: {
                    id: true,
                    order: true,
                    channel: true,
                    subject: true,
                    body: true,
                    templateId: true,
                    delayMinutes: true,
                    conditionType: true,
                    conditionAction: true,
                    sendWindowStart: true,
                    sendWindowEnd: true,
                  },
                },
              },
            },
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                optedOut: true,
              },
            },
          },
        });

        if (dueEnrollments.length === 0) return 0;

        let batchProcessed = 0;

        for (const enrollment of dueEnrollments) {
          try {
            await processEnrollment(enrollment);
            batchProcessed++;
          } catch (err) {
            console.error(`Sequence enrollment error [${enrollment.id}]:`, err);
            await prisma.campaignSequenceEnrollment
              .update({
                where: { id: enrollment.id },
                data: {
                  status: "stopped",
                  stoppedAt: new Date(),
                  stoppedReason: `error: ${(err as Error)?.message?.slice(0, 200) || "unknown"}`,
                  nextStepAt: null,
                },
              })
              .catch(() => {});
          }
        }

        return batchProcessed;
      });

      totalProcessed += processed;
      if (processed < BATCH_SIZE) break;
      batchCount++;
    }

    return {
      totalProcessed,
      batches: batchCount + 1,
    };
  },
);

async function processEnrollment(enrollment: {
  id: string;
  sequenceId: string;
  contactId: string;
  currentStep: number;
  sequence: {
    id: string;
    status: string;
    workspaceId: string;
    steps: {
      id: string;
      order: number;
      channel: string;
      subject: string | null;
      body: string;
      templateId: string | null;
      delayMinutes: number;
      conditionType: string | null;
      conditionAction: string;
      sendWindowStart: string | null;
      sendWindowEnd: string | null;
    }[];
  };
  contact: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string | null;
    optedOut: boolean;
  };
}): Promise<void> {
  if (enrollment.sequence.status !== "active") {
    return;
  }

  if (enrollment.contact.optedOut) {
    await prisma.campaignSequenceEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: "opted_out",
        stoppedAt: new Date(),
        stoppedReason: "contact_opted_out",
        nextStepAt: null,
      },
    });
    return;
  }

  const currentStep = enrollment.sequence.steps.find(
    (s) => s.order === enrollment.currentStep,
  );

  if (!currentStep) {
    await completeEnrollment(enrollment.id);
    return;
  }

  if (currentStep.sendWindowStart && currentStep.sendWindowEnd) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    if (
      currentTime < currentStep.sendWindowStart ||
      currentTime > currentStep.sendWindowEnd
    ) {
      const [startH, startM] = currentStep.sendWindowStart.split(":").map(Number);
      const nextWindow = new Date();

      if (currentTime > currentStep.sendWindowEnd) {
        nextWindow.setDate(nextWindow.getDate() + 1);
      }

      nextWindow.setHours(startH, startM, 0, 0);

      await prisma.campaignSequenceEnrollment.update({
        where: { id: enrollment.id },
        data: { nextStepAt: nextWindow },
      });
      return;
    }
  }

  if (currentStep.conditionType) {
    const conditionMet = await evaluateCondition(
      enrollment.id,
      enrollment.contactId,
      enrollment.sequenceId,
      currentStep.conditionType,
    );

    if (conditionMet) {
      switch (currentStep.conditionAction) {
        case "skip":
          await prisma.campaignSequenceStepLog.create({
            data: {
              enrollmentId: enrollment.id,
              stepId: currentStep.id,
              status: "skipped",
              channel: currentStep.channel,
              skippedReason: `condition_${currentStep.conditionType}`,
            },
          });
          await advanceToNextStep(enrollment, currentStep.order);
          return;

        case "stop":
          await prisma.campaignSequenceStepLog.create({
            data: {
              enrollmentId: enrollment.id,
              stepId: currentStep.id,
              status: "skipped",
              channel: currentStep.channel,
              skippedReason: `stopped_${currentStep.conditionType}`,
            },
          });
          await prisma.campaignSequenceEnrollment.update({
            where: { id: enrollment.id },
            data: {
              status: "stopped",
              stoppedAt: new Date(),
              stoppedReason: `condition_${currentStep.conditionType}`,
              nextStepAt: null,
            },
          });
          return;

        case "continue":
          break;
      }
    } else if (currentStep.conditionAction === "continue") {
      await prisma.campaignSequenceStepLog.create({
        data: {
          enrollmentId: enrollment.id,
          stepId: currentStep.id,
          status: "skipped",
          channel: currentStep.channel,
          skippedReason: `condition_not_met_${currentStep.conditionType}`,
        },
      });
      await advanceToNextStep(enrollment, currentStep.order);
      return;
    }
  }

  const result = await executeSequenceStep({
    enrollmentId: enrollment.id,
    stepId: currentStep.id,
    channel: currentStep.channel,
    subject: currentStep.subject,
    body: currentStep.body,
    contact: enrollment.contact,
    workspaceId: enrollment.sequence.workspaceId,
  });

  await prisma.campaignSequenceStepLog.create({
    data: {
      enrollmentId: enrollment.id,
      stepId: currentStep.id,
      status: result.success ? "sent" : "failed",
      channel: currentStep.channel,
      messageId: result.messageId || null,
      sentAt: result.success ? new Date() : null,
      failedAt: result.success ? null : new Date(),
      errorMessage: result.error || null,
    },
  });

  if (result.success) {
    await advanceToNextStep(enrollment, currentStep.order);
  } else {
    const recentFailures = await prisma.campaignSequenceStepLog.count({
      where: {
        enrollmentId: enrollment.id,
        stepId: currentStep.id,
        status: "failed",
      },
    });

    if (recentFailures >= 3) {
      await prisma.campaignSequenceEnrollment.update({
        where: { id: enrollment.id },
        data: {
          status: "stopped",
          stoppedAt: new Date(),
          stoppedReason: `step_${currentStep.order}_failed_3x`,
          nextStepAt: null,
        },
      });
    } else {
      const retryAt = new Date();
      retryAt.setMinutes(retryAt.getMinutes() + 15);
      await prisma.campaignSequenceEnrollment.update({
        where: { id: enrollment.id },
        data: { nextStepAt: retryAt },
      });
    }
  }
}

async function advanceToNextStep(
  enrollment: {
    id: string;
    sequence: {
      steps: { order: number; delayMinutes: number }[];
    };
  },
  currentOrder: number,
): Promise<void> {
  const nextStep = enrollment.sequence.steps.find((s) => s.order === currentOrder + 1);

  if (!nextStep) {
    await completeEnrollment(enrollment.id);
    return;
  }

  const nextStepAt = new Date();
  nextStepAt.setMinutes(nextStepAt.getMinutes() + nextStep.delayMinutes);

  await prisma.campaignSequenceEnrollment.update({
    where: { id: enrollment.id },
    data: {
      currentStep: nextStep.order,
      nextStepAt,
    },
  });
}

async function completeEnrollment(enrollmentId: string): Promise<void> {
  await prisma.campaignSequenceEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status: "completed",
      completedAt: new Date(),
      nextStepAt: null,
    },
  });
}

async function evaluateCondition(
  enrollmentId: string,
  contactId: string,
  _sequenceId: string,
  conditionType: string,
): Promise<boolean> {
  switch (conditionType) {
    case "replied": {
      // Check if any sent step in this enrollment has been replied to.
      const repliedLog = await prisma.campaignSequenceStepLog.findFirst({
        where: {
          enrollmentId,
          repliedAt: { not: null },
        },
        select: { id: true },
      });

      return !!repliedLog;
    }

    case "clicked": {
      const stepLogs = await prisma.campaignSequenceStepLog.findMany({
        where: {
          enrollmentId,
          status: { in: ["sent", "delivered"] },
          channel: "email",
        },
        select: { messageId: true },
      });

      if (stepLogs.length === 0) return false;

      const messageIds = stepLogs
        .map((log) => log.messageId)
        .filter(Boolean) as string[];

      if (messageIds.length === 0) return false;

      const clickedEmail = await prisma.emailSend.findFirst({
        where: {
          id: { in: messageIds },
          clickCount: { gt: 0 },
        },
        select: { id: true },
      });

      return !!clickedEmail;
    }

    case "no_reply": {
      const hasReplied = await evaluateCondition(
        enrollmentId,
        contactId,
        _sequenceId,
        "replied",
      );
      return !hasReplied;
    }

    case "opted_out": {
      const contact = await prisma.chatContact.findUnique({
        where: { id: contactId },
        select: { optedOut: true },
      });
      return contact?.optedOut === true;
    }

    default:
      return false;
  }
}
