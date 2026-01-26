import { channel, topic } from "@inngest/realtime";

export const openAiChannel = channel("openAi-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
