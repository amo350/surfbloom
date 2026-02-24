import { channel, topic } from "@inngest/realtime";

export const updateContactChannel = channel("update-contact-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
