import { channel, topic } from "@inngest/realtime";

export const contactCreatedChannel = channel("contact-created-trigger").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
