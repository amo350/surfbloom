import { channel, topic } from "@inngest/realtime";

export const sendEmailChannel = channel("send-email-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
