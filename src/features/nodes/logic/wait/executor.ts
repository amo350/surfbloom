import type { NodeExecutor } from "@/features/nodes/types";
import { waitChannel } from "./channel";

interface WaitData {
  amount?: number;
  unit?: "minutes" | "hours" | "days";
}

const UNIT_TO_SECONDS: Record<string, number> = {
  minutes: 60,
  hours: 3600,
  days: 86400,
};

export const waitExecutor: NodeExecutor<WaitData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(waitChannel().status({ nodeId, status: "loading" }));

  try {
    const amount = data.amount ?? 1;
    const unit = data.unit ?? "hours";

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      throw new Error("Wait amount must be a finite number greater than 0");
    }

    const multiplier = UNIT_TO_SECONDS[unit];
    if (!multiplier) {
      throw new Error(`Unsupported wait unit: ${unit}`);
    }

    const totalSeconds = amount * multiplier;

    const result = await step.run("wait-compute", async () => {
      return {
        ...context,
        _wait: {
          seconds: totalSeconds,
          label: `${amount} ${unit}`,
        },
      };
    });

    await publish(waitChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(waitChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
