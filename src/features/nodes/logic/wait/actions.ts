"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { waitChannel } from "./channel";

export type WaitToken = Realtime.Token<typeof waitChannel, ["status"]>;

export async function fetchWaitRealtimeToken(): Promise<WaitToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: waitChannel(),
    topics: ["status"],
  });

  return token;
}
