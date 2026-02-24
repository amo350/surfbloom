import type { NodeExecutor } from "@/features/nodes/types";
import { reviewReceivedChannel } from "./channel";

export const reviewReceivedExecutor: NodeExecutor = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(reviewReceivedChannel().status({ nodeId, status: "loading" }));

  try {
    const result = await step.run("review-received-trigger", async () => {
      const safeContext = context as Record<string, unknown>;
      const payloadContact =
        safeContext.contact && typeof safeContext.contact === "object"
          ? safeContext.contact
          : undefined;

      const resolvedContact = payloadContact;
      const resolvedContactId =
        (safeContext.contactId as string | undefined) ||
        (resolvedContact as { id?: string } | undefined)?.id;

      return {
        ...safeContext,
        ...(resolvedContactId ? { contactId: resolvedContactId } : {}),
        ...(resolvedContact ? { contact: resolvedContact } : {}),
        review: safeContext.review || {
          id: safeContext.reviewId,
          rating: safeContext.rating,
          text: safeContext.text,
          authorName: safeContext.authorName,
        },
      };
    });

    await publish(reviewReceivedChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(reviewReceivedChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
