"use server";

import { Realtime } from "@inngest/realtime";
import { createTriggerActions } from "@/features/nodes/triggers/lib/create-trigger-actions";
import { categoryAddedChannel } from "./channel";

export type CategoryAddedToken = Realtime.Token<
  typeof categoryAddedChannel,
  ["status"]
>;

const { fetchRealtimeToken } = createTriggerActions(categoryAddedChannel);

export const fetchCategoryAddedRealtimeToken =
  fetchRealtimeToken as () => Promise<CategoryAddedToken>;
