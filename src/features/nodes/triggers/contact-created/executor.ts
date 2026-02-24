import type { NodeExecutor } from "@/features/nodes/types";
import { contactCreatedChannel } from "./channel";

interface ContactCreatedData {
  source?: string;
}

export const contactCreatedExecutor: NodeExecutor<ContactCreatedData> = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(contactCreatedChannel().status({ nodeId, status: "loading" }));

  try {
    const result = await step.run("contact-created-trigger", async () => {
      const safeContext = context as Record<string, unknown>;
      return {
        ...safeContext,
        contact: safeContext.contact || {
          id: safeContext.contactId,
          firstName: safeContext.firstName,
          lastName: safeContext.lastName,
          email: safeContext.email,
          phone: safeContext.phone,
          stage: safeContext.stage,
          source: safeContext.source,
        },
      };
    });

    await publish(contactCreatedChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(contactCreatedChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
