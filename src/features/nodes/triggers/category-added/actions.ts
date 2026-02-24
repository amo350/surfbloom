"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { categoryAddedChannel } from "./channel";

export type CategoryAddedToken = Realtime.Token<
  typeof categoryAddedChannel,
  ["status"]
>;

export async function fetchCategoryAddedRealtimeToken(): Promise<CategoryAddedToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: categoryAddedChannel(),
    topics: ["status"],
  });
  return token;
}
