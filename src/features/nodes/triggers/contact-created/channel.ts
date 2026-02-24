import { channel, topic } from "@inngest/realtime";

export const CONTACT_CREATED_CHANNEL_NAME = "contact-created-trigger";

export const contactCreatedChannel = channel(CONTACT_CREATED_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
