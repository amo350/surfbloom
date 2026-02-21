import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { sendCampaignSend } from "./utils";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const checkRecurringCampaigns = inngest.createFunction(
  {
    id: "check-recurring-campaigns",
    retries: 1,
  },
  { cron: "0 * * * *" }, // Every hour, on the hour
  async ({ step }) => {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const currentDayOfWeek = now.getUTCDay(); // 0=Sun
    const currentDayOfMonth = now.getUTCDate(); // 1-31
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);

    // ─── Step 1: Find eligible recurring campaigns ──────
    const candidates = await step.run("find-candidates", async () => {
      const recurring = await prisma.campaign.findMany({
        where: {
          recurringType: { not: null },
          status: { in: ["scheduled", "completed"] },
          // Not expired
          OR: [{ recurringEndAt: null }, { recurringEndAt: { gte: now } }],
        },
        select: {
          id: true,
          workspaceId: true,
          createdById: true,
          name: true,
          channel: true,
          messageTemplate: true,
          audienceType: true,
          audienceStage: true,
          audienceCategoryId: true,
          audienceInactiveDays: true,
          frequencyCapDays: true,
          templateId: true,
          segmentId: true,
          variantB: true,
          variantSplit: true,
          sendWindowStart: true,
          sendWindowEnd: true,
          subject: true,
          recurringType: true,
          recurringDay: true,
          recurringTime: true,
          lastRecurredAt: true,
          groupId: true,
          workspace: {
            select: { timezone: true },
          },
        },
      });

      // Filter to campaigns that should run this hour
      return recurring.filter((c) => {
        if (!c.recurringType || !c.recurringTime) return false;

        // Parse recurring time (HH:mm)
        const [targetHour, targetMinute] = c.recurringTime
          .split(":")
          .map(Number);

        // TODO: timezone conversion — for now, use UTC
        // If workspace has timezone, offset targetHour to UTC
        // For V2, we compare against UTC directly
        if (targetHour !== currentHour) return false;

        // Only trigger in the first 5 minutes of the hour
        if (currentMinute > 5) return false;

        // Check day match
        if (c.recurringType === "weekly") {
          if (c.recurringDay !== currentDayOfWeek) return false;
        } else if (c.recurringType === "monthly") {
          // For months shorter than recurringDay, fire on last day
          const lastDayOfMonth = new Date(
            now.getUTCFullYear(),
            now.getUTCMonth() + 1,
            0,
          ).getUTCDate();
          const effectiveDay = Math.min(c.recurringDay!, lastDayOfMonth);
          if (effectiveDay !== currentDayOfMonth) return false;
        }

        // Skip if already ran today
        if (c.lastRecurredAt) {
          const lastRun = new Date(c.lastRecurredAt);
          if (lastRun >= todayStart) return false;
        }

        return true;
      });
    });

    if (candidates.length === 0) {
      return { triggered: 0 };
    }

    // ─── Step 2: Create child campaigns and trigger sends ─
    const triggered = await step.run("create-executions", async () => {
      let count = 0;

      for (const parent of candidates) {
        // Create a new campaign as a "run" of the recurring parent
        const child = await prisma.campaign.create({
          data: {
            workspaceId: parent.workspaceId,
            createdById: parent.createdById,
            groupId: parent.groupId,
            name: `${parent.name} — ${now.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}`,
            channel: parent.channel,
            messageTemplate: parent.messageTemplate,
            audienceType: parent.audienceType,
            audienceStage: parent.audienceStage,
            audienceCategoryId: parent.audienceCategoryId,
            audienceInactiveDays: parent.audienceInactiveDays,
            frequencyCapDays: parent.frequencyCapDays,
            templateId: parent.templateId,
            segmentId: parent.segmentId,
            variantB: parent.variantB,
            variantSplit: parent.variantSplit,
            sendWindowStart: parent.sendWindowStart,
            sendWindowEnd: parent.sendWindowEnd,
            subject: parent.subject,
            parentCampaignId: parent.id,
            status: "sending",
            startedAt: now,
            // No recurring fields — child is a one-time execution
          },
        });

        // Mark parent as ran
        await prisma.campaign.update({
          where: { id: parent.id },
          data: { lastRecurredAt: now },
        });

        // Trigger send
        await sendCampaignSend({ campaignId: child.id });
        count++;
      }

      return count;
    });

    return { triggered, candidates: candidates.length };
  },
);
