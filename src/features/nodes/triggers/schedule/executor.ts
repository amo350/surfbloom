import type { NodeExecutor } from "@/features/nodes/types";
import { scheduleChannel } from "./channel";

interface ScheduleData {
  frequency?: string;
  hour?: number;
  minute?: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

export const scheduleExecutor: NodeExecutor<ScheduleData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(scheduleChannel().status({ nodeId, status: "loading" }));

  try {
    const result = await step.run("schedule-trigger", async () => {
      const safeContext = context as Record<string, unknown>;
      const rawTimestamp = safeContext.timestamp;
      let firedAt = new Date().toISOString();

      if (
        typeof rawTimestamp === "string" ||
        typeof rawTimestamp === "number" ||
        rawTimestamp instanceof Date
      ) {
        const parsedTimestamp = new Date(rawTimestamp);
        if (!Number.isNaN(parsedTimestamp.getTime())) {
          firedAt = parsedTimestamp.toISOString();
        }
      }

      return {
        ...safeContext,
        schedule: {
          frequency: data.frequency,
          hour: data.hour,
          minute: data.minute,
          dayOfWeek: data.dayOfWeek,
          dayOfMonth: data.dayOfMonth,
          firedAt,
        },
      };
    });

    await publish(scheduleChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(scheduleChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
