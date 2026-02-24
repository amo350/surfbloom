import type { ConditionConfig } from "@/features/nodes/logic/lib/condition-presets";
import { evaluateCondition } from "@/features/nodes/logic/lib/evaluate-condition";
import type { NodeExecutor } from "@/features/nodes/types";
import { ifElseChannel } from "./channel";

interface IfElseData {
  condition?: ConditionConfig;
}

export const ifElseExecutor: NodeExecutor<IfElseData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(ifElseChannel().status({ nodeId, status: "loading" }));

  try {
    const result = await step.run("if-else-evaluate", async () => {
      if (!data.condition || !data.condition.field) {
        return {
          ...context,
          _branch: "true",
          _lastBranch: "true",
        };
      }

      const passed = await evaluateCondition(data.condition, context);

      return {
        ...context,
        _branch: passed ? "true" : "false",
        _lastBranch: passed ? "true" : "false",
      };
    });

    await publish(ifElseChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(ifElseChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
