"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { sendSmsChannel } from "./channel";

export type SendSmsToken = Realtime.Token<typeof sendSmsChannel, ["status"]>;

export async function fetchSendSmsRealtimeToken(): Promise<SendSmsToken> {
  return getSubscriptionToken(inngest, {
    channel: sendSmsChannel(),
    topics: ["status"],
  });
}
