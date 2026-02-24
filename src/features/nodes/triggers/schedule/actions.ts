"use server";

import { Realtime } from "@inngest/realtime";
import { createTriggerActions } from "@/features/nodes/triggers/lib/create-trigger-actions";
import { scheduleChannel } from "./channel";

export type ScheduleToken = Realtime.Token<typeof scheduleChannel, ["status"]>;

const { fetchRealtimeToken } = createTriggerActions(scheduleChannel);

export const fetchScheduleRealtimeToken =
  fetchRealtimeToken as () => Promise<ScheduleToken>;
