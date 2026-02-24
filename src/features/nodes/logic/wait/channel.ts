import { channel, topic } from "@inngest/realtime";

export const waitChannel = channel("wait-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
