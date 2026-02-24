import { channel, topic } from "@inngest/realtime";

export const aiNodeChannel = channel("ai-node-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
