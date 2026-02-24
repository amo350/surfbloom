"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { ifElseChannel } from "./channel";

export type IfElseToken = Realtime.Token<typeof ifElseChannel, ["status"]>;

export async function fetchIfElseRealtimeToken(): Promise<IfElseToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: ifElseChannel(),
    topics: ["status"],
  });

  return token;
}
