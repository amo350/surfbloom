import type { NodeExecutor } from "@/features/nodes/types";
import { reviewReceivedChannel } from "./channel";

interface ReviewReceivedData {
  minRating?: number;
  maxRating?: number;
}

export const reviewReceivedExecutor: NodeExecutor<ReviewReceivedData> = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(reviewReceivedChannel().status({ nodeId, status: "loading" }));

  try {
    const result = await step.run("review-received-trigger", async () => {
      const safeContext = context as Record<string, unknown>;
      return {
        ...safeContext,
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
