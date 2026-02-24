import type { NodeExecutor } from "@/features/nodes/types";
import { categoryAddedChannel } from "./channel";

export const categoryAddedExecutor: NodeExecutor = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(categoryAddedChannel().status({ nodeId, status: "loading" }));

  try {
    // Keep this in step.run for durable observability in Inngest traces.
    const result = await step.run("category-added-trigger", async () => {
      const safeContext = context as Record<string, unknown>;
      return {
        ...safeContext,
        category: {
          id: safeContext.categoryId,
          name: safeContext.categoryName,
        },
        contact: safeContext.contact || {
          id: safeContext.contactId,
        },
      };
    });

    await publish(categoryAddedChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(categoryAddedChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
