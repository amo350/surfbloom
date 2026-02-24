"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";

type TriggerChannelFactory = () => unknown;

export function createTriggerActions<C extends TriggerChannelFactory>(
  getChannel: C,
) {
  type TriggerToken = Realtime.Token<C, ["status"]>;

  async function fetchRealtimeToken(): Promise<TriggerToken> {
    const token = await getSubscriptionToken(inngest, {
      channel: getChannel(),
      topics: ["status"],
    });
    return token as TriggerToken;
  }

  return { fetchRealtimeToken };
}
