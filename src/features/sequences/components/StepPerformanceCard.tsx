"use client";

import {
  CheckCircle,
  Mail,
  MessageSquare,
  SkipForward,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";

interface StepStat {
  stepId: string;
  order: number;
  channel: string;
  subject: string | null;
  bodyPreview: string;
  sent: number;
  delivered: number;
  failed: number;
  skipped: number;
  total: number;
}

export function StepPerformanceCard({ step }: { step: StepStat }) {
  const isEmail = step.channel === "email";
  const nonSkippedTotal = step.sent + step.delivered + step.failed;
  const successRate =
    nonSkippedTotal > 0
      ? Math.round((step.delivered / nonSkippedTotal) * 100)
      : null;

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <div className="flex items-start gap-2">
        <span className="h-6 min-w-6 px-1 rounded bg-muted text-[11px] font-semibold flex items-center justify-center">
          {step.order}
        </span>
        {isEmail ? (
          <Mail className="h-4 w-4 text-blue-500 mt-0.5" />
        ) : (
          <MessageSquare className="h-4 w-4 text-teal-500 mt-0.5" />
        )}
        <p className="text-sm font-medium leading-5 line-clamp-2">
          {isEmail && step.subject
            ? step.subject
            : step.bodyPreview || "Untitled step"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <StatBlock label="Sent" value={step.sent} />
        <StatBlock label="Delivered" value={step.delivered} />
        <StatBlock label="Failed" value={step.failed} />
        <StatBlock label="Skipped" value={step.skipped} />
        <StatBlock
          label="Success"
          value={successRate === null ? "-" : `${successRate}%`}
          icon={<CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
        />
      </div>

      {step.total > 0 && (
        <div className="h-2 rounded overflow-hidden bg-muted flex">
          <div
            className="h-full bg-emerald-500"
            style={{
              width: `${(step.delivered / step.total) * 100}%`,
            }}
          />
          <div
            className="h-full bg-red-400"
            style={{
              width: `${(step.failed / step.total) * 100}%`,
            }}
          />
          <div
            className="h-full bg-amber-300"
            style={{ width: `${(step.skipped / step.total) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

function StatBlock({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon?: ReactNode;
}) {
  const fallbackIcon =
    label === "Failed" ? (
      <XCircle className="h-3.5 w-3.5 text-red-500" />
    ) : label === "Skipped" ? (
      <SkipForward className="h-3.5 w-3.5 text-amber-600" />
    ) : (
      <CheckCircle className="h-3.5 w-3.5 text-teal-600" />
    );

  return (
    <div className="rounded border p-2">
      <div className="flex items-center gap-1">
        {icon || fallbackIcon}
        <p className="text-sm font-semibold">{value}</p>
      </div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
