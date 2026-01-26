import type { NodeExecutor } from "@/features/nodes/types";
import { stripeTriggerChannel } from "@/features/nodes/channels/stripe-trigger";

type StripeFormTriggerData = Record<string, unknown>;

export const stripeTriggerExecutor: NodeExecutor<
  StripeFormTriggerData
> = async ({ nodeId, context, step, publish }) => {
  await publish(
    stripeTriggerChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const result = await step.run("stripe-trigger", async () => context);
  await publish(
    stripeTriggerChannel().status({
      nodeId,
      status: "success",
    }),
  );
  return result;
};
