import { channel, topic } from "@inngest/realtime";

export const reviewReceivedChannel = channel("review-received-trigger").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
