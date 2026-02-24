"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { scheduleChannel } from "./channel";

export type ScheduleToken = Realtime.Token<typeof scheduleChannel, ["status"]>;

export async function fetchScheduleRealtimeToken(): Promise<ScheduleToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: scheduleChannel(),
    topics: ["status"],
  });
  return token;
}
