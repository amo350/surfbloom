import { channel, topic } from "@inngest/realtime";

export const sendSmsChannel = channel("send-sms-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
