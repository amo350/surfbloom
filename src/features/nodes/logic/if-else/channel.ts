import { channel, topic } from "@inngest/realtime";

export const ifElseChannel = channel("if-else-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
