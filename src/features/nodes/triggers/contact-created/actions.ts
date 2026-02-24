"use server";

import { Realtime } from "@inngest/realtime";
import { createTriggerActions } from "@/features/nodes/triggers/lib/create-trigger-actions";
import { contactCreatedChannel } from "./channel";

export type ContactCreatedToken = Realtime.Token<
  typeof contactCreatedChannel,
  ["status"]
>;

const { fetchRealtimeToken } = createTriggerActions(contactCreatedChannel);

export const fetchContactCreatedRealtimeToken =
  fetchRealtimeToken as () => Promise<ContactCreatedToken>;
