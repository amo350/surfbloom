"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { slackChannel } from "@/features/nodes/channels/slack";
import { inngest } from "@/inngest/client";

export type SlackToken = Realtime.Token<typeof slackChannel, ["status"]>;

export async function fetchSlackRealtimeToken(): Promise<SlackToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: slackChannel(),
    topics: ["status"],
  });

  return token;
}
