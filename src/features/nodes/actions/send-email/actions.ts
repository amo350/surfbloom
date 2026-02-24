"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { sendEmailChannel } from "./channel";

export type SendEmailToken = Realtime.Token<
  typeof sendEmailChannel,
  ["status"]
>;

export async function fetchSendEmailRealtimeToken(): Promise<SendEmailToken> {
  return getSubscriptionToken(inngest, {
    channel: sendEmailChannel(),
    topics: ["status"],
  });
}
