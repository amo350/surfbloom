import { channel, topic } from "@inngest/realtime";

export const createTaskChannel = channel("create-task-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
