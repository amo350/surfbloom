import type { NodeExecutor } from "@/features/nodes/types";
import { manualTriggerChannel } from "@/features/nodes/channels/manual-trigger";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    manualTriggerChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const result = await step.run("manual-trigger", async () => context);
  await publish(
    manualTriggerChannel().status({
      nodeId,
      status: "success",
    }),
  );
  return result;
};
