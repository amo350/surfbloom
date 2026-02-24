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
      return {
        ...safeContext,
        schedule: {
          frequency: data.frequency,
          firedAt: safeContext.timestamp || new Date().toISOString(),
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
