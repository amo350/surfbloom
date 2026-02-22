"use client";

import { useState } from "react";
import {
  Plus,
  Loader2,
  ArrowLeft,
  Play,
  Pause,
  BarChart3,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import { useSequence, useUpdateSequence, useDeleteStep } from "../hooks/use-sequences";
import { StepCard } from "./StepCard";
import { StepEditor } from "./StepEditor";
import { SequenceSettings } from "./SequenceSettings";
import { TimelineConnector } from "./SequenceTimeline";
import { useCategories } from "@/features/contacts/hooks/use-contacts";
import { useKeywords } from "@/features/campaigns/hooks/use-keywords";

interface SequenceBuilderProps {
  sequenceId: string;
  workspaceId: string;
  basePath: string;
}

export function SequenceBuilder({
  sequenceId,
  workspaceId,
  basePath,
}: SequenceBuilderProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editStep, setEditStep] = useState<any>(null);
  const [settingsExpanded, setSettingsExpanded] = useState(true);

  const { data: sequence, isLoading } = useSequence(sequenceId);
  const { data: categories } = useCategories(workspaceId);
  const { data: keywords } = useKeywords(workspaceId);
  const updateSequence = useUpdateSequence();
  const deleteStep = useDeleteStep();

  const isActive = sequence?.status === "active";
  const isDraft = sequence?.status === "draft";

  const handleActivate = () => {
    if (!sequence) return;

    if (sequence.steps.length === 0) {
      toast.error("Add at least one step before activating");
      return;
    }

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

  const handleDeleteStep = (stepId: string) => {
    deleteStep.mutate(
      { id: stepId },
      {
        onSuccess: () => toast.success("Step deleted"),
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
    return (
      <div className="flex flex-col items-center py-24">
        <p className="text-sm text-muted-foreground">Sequence not found</p>
      </div>
    );
  }

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
              <StatusBadge status={sequence.status} />
              <span className="text-[10px] text-muted-foreground">
                {sequence.steps.length} step{sequence.steps.length !== 1 ? "s" : ""}
                {" · "}
                {sequence.enrollmentStats.active} active enrollment
                {sequence.enrollmentStats.active !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sequence.status !== "draft" && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`${basePath}/campaigns/sequences/${sequenceId}?tab=detail`}>
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                Performance
              </Link>
            </Button>
          )}
          {isActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePause}
              disabled={updateSequence.isPending}
            >
              <Pause className="h-3.5 w-3.5 mr-1.5" />
              Pause
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleActivate}
              disabled={updateSequence.isPending || sequence.steps.length === 0}
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              {isDraft ? "Activate" : "Resume"}
            </Button>
          )}
        </div>
      </AppHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          {isActive && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Sequence is active</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Pause to edit steps, audience, or trigger settings. Active
                  enrollments will continue from their current step.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <button
                type="button"
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2 lg:hidden"
              >
                {settingsExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                Settings
              </button>

              <div className={`${settingsExpanded ? "" : "hidden lg:block"}`}>
                <SequenceSettings
                  sequence={sequence}
                  categories={categories || []}
                  keywords={keywords || []}
                />
              </div>

              <div className="border rounded-lg p-4 bg-white mt-3 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Enrollments
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <StatCell
                    label="Active"
                    value={sequence.enrollmentStats.active}
                    color="text-emerald-600"
                  />
                  <StatCell
                    label="Completed"
                    value={sequence.enrollmentStats.completed}
                    color="text-blue-600"
                  />
                  <StatCell
                    label="Stopped"
                    value={sequence.enrollmentStats.stopped}
                    color="text-amber-600"
                  />
                  <StatCell
                    label="Opted Out"
                    value={sequence.enrollmentStats.optedOut}
                    color="text-red-600"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="space-y-0">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-emerald-50 border-emerald-200">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700">
                    Contact enrolled
                  </span>
                </div>

                {sequence.steps.map((step: any) => (
                  <div key={step.id}>
                    <TimelineConnector delayMinutes={step.delayMinutes} />
                    <StepCard
                      step={step}
                      isActive={isActive}
                      onEdit={() => {
                        setEditStep(step);
                        setEditorOpen(true);
                      }}
                      onDelete={() => handleDeleteStep(step.id)}
                    />
                  </div>
                ))}

                {!isActive && (
                  <>
                    {sequence.steps.length > 0 && (
                      <div className="flex flex-col items-center py-1">
                        <div className="w-px h-6 bg-border" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEditStep(null);
                        setEditorOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-muted-foreground/20 text-muted-foreground hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50/30 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-sm font-medium">Add Step</span>
                    </button>
                  </>
                )}

                {sequence.steps.length > 0 && (
                  <>
                    <div className="flex flex-col items-center py-1">
                      <div className="w-px h-6 bg-border" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-slate-50 border-slate-200">
                      <div className="h-2 w-2 rounded-full bg-slate-400" />
                      <span className="text-xs font-medium text-slate-600">
                        Sequence complete
                      </span>
                    </div>
                  </>
                )}

                {sequence.steps.length === 0 && !isActive && (
                  <div className="flex flex-col items-center py-8 text-center">
                    <p className="text-sm text-muted-foreground mt-4">
                      No steps yet. Add your first step to build the sequence.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StepEditor
        open={editorOpen}
        onOpenChange={(v) => {
          setEditorOpen(v);
          if (!v) setEditStep(null);
        }}
        sequenceId={sequenceId}
        editStep={editStep}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    draft: { bg: "bg-slate-100", text: "text-slate-600", label: "Draft" },
    active: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Active" },
    paused: { bg: "bg-amber-100", text: "text-amber-700", label: "Paused" },
    archived: { bg: "bg-red-100", text: "text-red-700", label: "Archived" },
  };

  const c = config[status] || config.draft;

  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function StatCell({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${color}`}>{value}</p>
    </div>
  );
}
