"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Loader2,
  ArrowLeft,
  Play,
  Pause,
  UserPlus,
  Users,
  CheckCircle,
  StopCircle,
  XCircle,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  useSequence,
  useStepStats,
  useUpdateSequence,
} from "../hooks/use-sequences";
import { StepPerformanceCard } from "./StepPerformanceCard";
import { EnrollmentTable } from "./EnrollmentTable";
import { EnrollContactDialog } from "./EnrollContactDialog";

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-slate-100", text: "text-slate-600", label: "Draft" },
  active: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Active" },
  paused: { bg: "bg-amber-100", text: "text-amber-700", label: "Paused" },
  archived: { bg: "bg-red-100", text: "text-red-700", label: "Archived" },
};

const TRIGGER_LABELS: Record<string, string> = {
  manual: "Manual enrollment",
  contact_created: "New contact created",
  keyword_join: "Keyword join",
  stage_change: "Stage change",
};

interface SequenceDetailProps {
  sequenceId: string;
  workspaceId: string;
  basePath: string;
}

export function SequenceDetail({
  sequenceId,
  workspaceId,
  basePath,
}: SequenceDetailProps) {
  const [tab, setTab] = useState<"overview" | "enrollments">("overview");
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);

  const { data: sequence, isLoading } = useSequence(sequenceId);
  const { data: stepStats } = useStepStats(sequenceId);
  const updateSequence = useUpdateSequence();

  const handleActivate = () => {
    updateSequence.mutate(
      { id: sequenceId, status: "active" },
      {
        onSuccess: () => toast.success("Sequence activated"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const handlePause = () => {
    updateSequence.mutate(
      { id: sequenceId, status: "paused" },
      {
        onSuccess: () => toast.success("Sequence paused"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sequence) {
    return <div className="p-8 text-sm text-muted-foreground">Sequence not found</div>;
  }

  const config = STATUS_CONFIG[sequence.status] || STATUS_CONFIG.draft;
  const stats = sequence.enrollmentStats;

  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <div className="flex items-center gap-3 flex-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`${basePath}/campaigns/sequences`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <AppHeaderTitle title={sequence.name} />
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bg} ${config.text}`}>
                {config.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {sequence.steps.length} step{sequence.steps.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sequence.status === "active" && (
            <Button variant="outline" size="sm" onClick={() => setEnrollDialogOpen(true)}>
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Enroll
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`${basePath}/campaigns/sequences/${sequenceId}`}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit Steps
            </Link>
          </Button>
          {sequence.status === "active" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePause}
              disabled={updateSequence.isPending}
            >
              <Pause className="h-3.5 w-3.5 mr-1.5" />
              Pause
            </Button>
          ) : sequence.status !== "archived" ? (
            <Button
              size="sm"
              onClick={handleActivate}
              disabled={updateSequence.isPending || sequence.steps.length === 0}
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              {sequence.status === "draft" ? "Activate" : "Resume"}
            </Button>
          ) : null}
        </div>
      </AppHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <HeroStat label="Total" value={stats.total} icon={<Users className="h-4 w-4" />} />
            <HeroStat
              label="Active"
              value={stats.active}
              icon={<Users className="h-4 w-4 text-teal-600" />}
            />
            <HeroStat
              label="Completed"
              value={stats.completed}
              icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
            />
            <HeroStat
              label="Stopped"
              value={stats.stopped}
              icon={<StopCircle className="h-4 w-4 text-amber-600" />}
            />
            <HeroStat
              label="Opted Out"
              value={stats.optedOut}
              icon={<XCircle className="h-4 w-4 text-red-600" />}
            />
          </div>

          <div className="rounded-lg border p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCell
              label="Trigger"
              value={`${TRIGGER_LABELS[sequence.triggerType] || sequence.triggerType}${
                sequence.triggerValue ? ` (${sequence.triggerValue})` : ""
              }`}
            />
            <InfoCell
              label="Audience"
              value={
                sequence.audienceType === "all"
                  ? "All contacts"
                  : sequence.audienceType === "stage"
                    ? `Stage: ${sequence.audienceStage || "-"}`
                    : sequence.audienceType === "category"
                      ? "Category filter"
                      : `Inactive ${sequence.audienceInactiveDays || 0}+ days`
              }
            />
            <InfoCell
              label="Frequency Cap"
              value={
                sequence.frequencyCapDays
                  ? `${sequence.frequencyCapDays} day(s)`
                  : "No cap"
              }
            />
          </div>

          <div className="border-b flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab("overview")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === "overview"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Step Performance
            </button>
            <button
              type="button"
              onClick={() => setTab("enrollments")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === "enrollments"
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Enrollments ({stats.total})
            </button>
          </div>

          {tab === "overview" && (
            <div className="space-y-3">
              {stepStats && stepStats.length > 0 ? (
                stepStats.map((step: any) => (
                  <StepPerformanceCard key={step.stepId} step={step} />
                ))
              ) : (
                <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
                  {sequence.steps.length === 0
                    ? "No steps configured yet."
                    : "No step activity yet. Stats appear after sends begin."}
                </div>
              )}
            </div>
          )}

          {tab === "enrollments" && (
            <EnrollmentTable sequenceId={sequenceId} totalSteps={sequence.steps.length} />
          )}
        </div>
      </div>

      <EnrollContactDialog
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
        sequenceId={sequenceId}
        workspaceId={workspaceId}
      />
    </div>
  );
}

function HeroStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
