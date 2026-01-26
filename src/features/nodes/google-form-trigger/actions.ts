"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { googleFormTriggerChannel } from "@/features/nodes/channels/google-form-trigger";
import { inngest } from "@/inngest/client";

export type GoogleFormTriggerToken = Realtime.Token<
  typeof googleFormTriggerChannel,
  ["status"]
>;

export async function fetchGoogleFormTriggerRealtimeToken(): Promise<GoogleFormTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: googleFormTriggerChannel(),
    topics: ["status"],
  });

  return token;
}
