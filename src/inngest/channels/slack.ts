import { channel, topic } from "@inngest/realtime";

export const slackChannel = channel("slack-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
