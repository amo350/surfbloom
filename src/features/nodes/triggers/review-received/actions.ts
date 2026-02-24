"use server";

import { Realtime } from "@inngest/realtime";
import { createTriggerActions } from "@/features/nodes/triggers/lib/create-trigger-actions";
import { reviewReceivedChannel } from "./channel";

export type ReviewReceivedToken = Realtime.Token<
  typeof reviewReceivedChannel,
  ["status"]
>;

const { fetchRealtimeToken } = createTriggerActions(reviewReceivedChannel);

export const fetchReviewReceivedRealtimeToken =
  fetchRealtimeToken as () => Promise<ReviewReceivedToken>;
