"use client";

import { Loader2, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useReportingTopCampaigns } from "@/features/campaigns/hooks/use-reporting";

const SORTS: Array<{
  value: "sent" | "delivered" | "replied" | "reply_rate";
  label: string;
}> = [
  { value: "sent", label: "Sent" },
  { value: "delivered", label: "Delivered" },
  { value: "replied", label: "Replied" },
  { value: "reply_rate", label: "Reply Rate" },
];

export function TopCampaignsTable({
  workspaceId,
  days,
  channel,
}: {
  workspaceId?: string;
  days: number;
  channel: "all" | "sms" | "email";
}) {
  const [sortBy, setSortBy] = useState<
    "sent" | "delivered" | "replied" | "reply_rate"
  >("sent");
  const { data, isLoading } = useReportingTopCampaigns({
    workspaceId,
    days,
    channel,
    sortBy,
    limit: 10,
  });

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Top Campaigns</p>
          <p className="text-xs text-muted-foreground">
            Best performers by selected metric
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                sortBy === s.value
                  ? "bg-slate-900 text-white"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
              onClick={() => setSortBy(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !data ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1.5fr_90px_70px_90px_90px_90px] px-3 py-2 bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            <span>Campaign</span>
            <span>Channel</span>
            <span className="text-right">Sent</span>
            <span className="text-right">Delivered</span>
            <span className="text-right">Reply Rate</span>
            <span className="text-right">Date</span>
          </div>
          {data.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1.5fr_90px_70px_90px_90px_90px] px-3 py-2.5 border-t text-xs items-center"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{row.name}</p>
                <p className="text-muted-foreground truncate">
                  {row.workspace?.name || "—"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                {row.channel === "email" ? (
                  <Mail className="h-3 w-3 text-blue-500" />
                ) : (
                  <MessageSquare className="h-3 w-3 text-teal-500" />
                )}
                {row.channel.toUpperCase()}
              </span>
              <span className="text-right tabular-nums">
                {row.sentCount.toLocaleString()}
              </span>
              <span className="text-right tabular-nums">
                {row.deliveredCount.toLocaleString()}
              </span>
              <span className="text-right tabular-nums">
                {row.replyRate.toFixed(1)}%
              </span>
              <span className="text-right text-muted-foreground">
                {new Date(row.completedAt || row.createdAt).toLocaleDateString(
                  undefined,
                  {
                    month: "short",
                    day: "numeric",
                  },
                )}
              </span>
            </div>
          ))}
          {data.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No campaigns found for this range.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
