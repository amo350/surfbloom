import type { NodeExecutor } from "@/features/nodes/types";
import { categoryAddedChannel } from "./channel";

interface CategoryAddedData {
  categoryName?: string;
}

export const categoryAddedExecutor: NodeExecutor<CategoryAddedData> = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(categoryAddedChannel().status({ nodeId, status: "loading" }));

  try {
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
