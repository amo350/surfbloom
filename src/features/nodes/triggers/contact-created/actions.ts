"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { contactCreatedChannel } from "./channel";

export type ContactCreatedToken = Realtime.Token<
  typeof contactCreatedChannel,
  ["status"]
>;

export async function fetchContactCreatedRealtimeToken(): Promise<ContactCreatedToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: contactCreatedChannel(),
    topics: ["status"],
  });
  return token;
}
