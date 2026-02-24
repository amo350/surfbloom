// biome-ignore-all assist/source/organizeImports: keep current import grouping for this module.
"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { aiNodeChannel } from "./channel";
import { inngest } from "@/inngest/client";

export type AiNodeToken = Realtime.Token<typeof aiNodeChannel, ["status"]>;

export async function fetchAiNodeRealtimeToken(): Promise<AiNodeToken> {
  return getSubscriptionToken(inngest, {
    channel: aiNodeChannel(),
    topics: ["status"],
  });
}
