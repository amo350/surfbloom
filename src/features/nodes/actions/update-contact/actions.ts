"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { updateContactChannel } from "./channel";

export type UpdateContactToken = Realtime.Token<
  typeof updateContactChannel,
  ["status"]
>;

export async function fetchUpdateContactRealtimeToken(): Promise<UpdateContactToken> {
  return getSubscriptionToken(inngest, {
    channel: updateContactChannel(),
    topics: ["status"],
  });
}
