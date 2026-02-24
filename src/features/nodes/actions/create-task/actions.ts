"use server";

import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { createTaskChannel } from "./channel";

export type CreateTaskToken = Realtime.Token<
  typeof createTaskChannel,
  ["status"]
>;

export async function fetchCreateTaskRealtimeToken(): Promise<CreateTaskToken> {
  return getSubscriptionToken(inngest, {
    channel: createTaskChannel(),
    topics: ["status"],
  });
}
