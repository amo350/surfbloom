"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { xAiChannel } from "@/features/nodes/channels/xAi";
import { inngest } from "@/inngest/client";

export type XAiToken = Realtime.Token<typeof xAiChannel, ["status"]>;

export async function fetchXAiRealtimeToken(): Promise<XAiToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: xAiChannel(),
    topics: ["status"],
  });

  return token;
}
