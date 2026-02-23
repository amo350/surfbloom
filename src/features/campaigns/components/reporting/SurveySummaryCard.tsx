"use client";

import { Loader2, ClipboardList } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import Link from "next/link";

interface SurveySummaryCardProps {
  workspaceId?: string;
  days: number;
}

export function SurveySummaryCard({ workspaceId, days }: SurveySummaryCardProps) {
  const trpc = useTRPC();

  const { data, isLoading, isError, error } = useQuery(
    trpc.analytics.getSurveySummary.queryOptions({ workspaceId, days }),
  );

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-white p-4 flex justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border rounded-lg bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="h-4 w-4 text-red-500" />
          <h4 className="text-sm font-semibold">Surveys</h4>
        </div>
        <p className="text-xs text-red-600 text-center py-4">
          {error instanceof Error
            ? error.message
            : "Failed to load survey summary"}
        </p>
      </div>
    );
  }

  if (!data || data.totalSent === 0) {
    return (
      <div className="border rounded-lg bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Surveys</h4>
        </div>
        <p className="text-xs text-muted-foreground text-center py-4">
          No survey responses in the last {days} days
        </p>
        <Link
          href={
            workspaceId
              ? `/workspaces/${workspaceId}/campaigns/surveys`
              : "/index/campaigns/surveys"
          }
          className="text-xs text-teal-600 hover:underline flex justify-center"
        >
          Go to Surveys →
        </Link>
      </div>
    );
  }

  const npsTotal = data.promoters + data.passives + data.detractors;

  return (
    <div className="border rounded-lg bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-teal-500" />
          <h4 className="text-sm font-semibold">Surveys</h4>
        </div>
        <Link
          href={
            workspaceId
              ? `/workspaces/${workspaceId}/campaigns/surveys`
              : "/index/campaigns/surveys"
          }
          className="text-[10px] text-teal-600 hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div>
          <p className="text-lg font-semibold">{data.activeSurveys}</p>
          <p className="text-[10px] text-muted-foreground">Active</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{data.completed}</p>
          <p className="text-[10px] text-muted-foreground">Responses</p>
        </div>
        <div>
          <p className="text-lg font-semibold">
            {data.avgScore != null ? data.avgScore.toFixed(1) : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">Avg Score</p>
        </div>
        <div>
          <p
            className={`text-lg font-semibold ${
              data.nps != null
                ? data.nps >= 50
                  ? "text-emerald-600"
                  : data.nps >= 0
                    ? "text-blue-600"
                    : "text-red-600"
                : ""
            }`}
          >
            {data.nps != null ? `${data.nps > 0 ? "+" : ""}${data.nps}` : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">NPS</p>
        </div>
      </div>

      {data.nps != null && npsTotal > 0 && (
        <div>
          <div className="h-2 rounded-full overflow-hidden flex bg-muted/20">
            {data.promoters > 0 && (
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${(data.promoters / npsTotal) * 100}%`,
                }}
              />
            )}
            {data.passives > 0 && (
              <div
                className="h-full bg-amber-400"
                style={{
                  width: `${(data.passives / npsTotal) * 100}%`,
                }}
              />
            )}
            {data.detractors > 0 && (
              <div
                className="h-full bg-red-400"
                style={{
                  width: `${(data.detractors / npsTotal) * 100}%`,
                }}
              />
            )}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-emerald-600">
              {data.promoters} promoters
            </span>
            <span className="text-[9px] text-amber-600">
              {data.passives} passives
            </span>
            <span className="text-[9px] text-red-600">
              {data.detractors} detractors
            </span>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Completion rate</span>
        <span className="text-xs font-medium">
          {data.completionRate.toFixed(0)}% ({data.completed}/{data.totalSent})
        </span>
      </div>
    </div>
  );
}
