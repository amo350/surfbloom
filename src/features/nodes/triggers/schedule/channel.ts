import { channel, topic } from "@inngest/realtime";

export const scheduleChannel = channel("schedule-trigger").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
