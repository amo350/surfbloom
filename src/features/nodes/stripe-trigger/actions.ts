"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { stripeTriggerChannel } from "@/features/nodes/channels/stripe-trigger";
import { inngest } from "@/inngest/client";

export type StripeTriggerToken = Realtime.Token<
  typeof stripeTriggerChannel,
  ["status"]
>;

export async function fetchStripeTriggerRealtimeToken(): Promise<StripeTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: stripeTriggerChannel(),
    topics: ["status"],
  });

  return token;
}
