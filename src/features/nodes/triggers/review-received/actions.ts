"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { reviewReceivedChannel } from "./channel";

export type ReviewReceivedToken = Realtime.Token<
  typeof reviewReceivedChannel,
  ["status"]
>;

export async function fetchReviewReceivedRealtimeToken(): Promise<ReviewReceivedToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: reviewReceivedChannel(),
    topics: ["status"],
  });
  return token;
}
