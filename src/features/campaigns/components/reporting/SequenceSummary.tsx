"use client";

import { Loader2, PauseCircle, PlayCircle } from "lucide-react";
import { useReportingSequences } from "@/features/campaigns/hooks/use-reporting";

const STATUS_STYLES: Record<string, string> = {
  active: "text-emerald-600",
  paused: "text-amber-600",
  draft: "text-slate-500",
  archived: "text-red-600",
};

export function SequenceSummary({ workspaceId }: { workspaceId?: string }) {
  const { data, isLoading } = useReportingSequences(workspaceId);
  type SequenceItem = NonNullable<typeof data>[number];

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold">Sequence Performance</p>
        <p className="text-xs text-muted-foreground">
          Active and paused drip sequence throughput
        </p>
      </div>

      {isLoading || !data ? (
        <div className="h-[140px] flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-[120px] flex items-center justify-center text-sm text-muted-foreground">
          No sequences found.
        </div>
      ) : (
        <div className="space-y-2.5">
          {data.slice(0, 8).map((seq: SequenceItem) => {
            const total = seq.enrollmentStats?.total || 0;
            const completed = seq.enrollmentStats?.completed || 0;
            const completionRate = total > 0 ? (completed / total) * 100 : 0;
            return (
              <div key={seq.id} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{seq.name}</p>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 ${STATUS_STYLES[seq.status] || "text-slate-500"}`}
                      >
                        {seq.status === "active" ? (
                          <PlayCircle className="h-3 w-3" />
                        ) : (
                          <PauseCircle className="h-3 w-3" />
                        )}
                        {seq.status}
                      </span>
                      <span>{total} enrolled</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium tabular-nums">
                    {completionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded bg-muted overflow-hidden">
                  <div
                    className="h-full bg-teal-500"
                    style={{ width: `${Math.min(100, completionRate)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
