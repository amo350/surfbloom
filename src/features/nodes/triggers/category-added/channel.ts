import { channel, topic } from "@inngest/realtime";

export const categoryAddedChannel = channel("category-added-trigger").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
