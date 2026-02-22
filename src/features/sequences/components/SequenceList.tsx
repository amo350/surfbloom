"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Workflow,
  Archive,
  Trash2,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useSequences,
  useUpdateSequence,
  useDeleteSequence,
} from "../hooks/use-sequences";
import { SequenceCreateDialog } from "./SequenceCreateDialog";

const STATUS_FILTERS: Array<{
  value: "active" | "draft" | "paused" | "archived" | undefined;
  label: string;
}> = [
  { value: undefined, label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-slate-100", text: "text-slate-600", label: "Draft" },
  active: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Active" },
  paused: { bg: "bg-amber-100", text: "text-amber-700", label: "Paused" },
  archived: { bg: "bg-red-100", text: "text-red-700", label: "Archived" },
};

const TRIGGER_LABELS: Record<string, string> = {
  manual: "Manual",
  contact_created: "New Contact",
  keyword_join: "Keyword Join",
  stage_change: "Stage Change",
};

interface SequenceListProps {
  workspaceId?: string;
  basePath: string;
}

export function SequenceList({ workspaceId, basePath }: SequenceListProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "active" | "draft" | "paused" | "archived" | undefined
  >(undefined);

  const { data: sequences, isLoading } = useSequences({
    workspaceId,
    status: statusFilter,
  });
  const updateSequence = useUpdateSequence();
  const deleteSequence = useDeleteSequence();

  const handleDelete = (id: string) => {
    deleteSequence.mutate(
      { id },
      {
        onSuccess: () => toast.success("Sequence deleted"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const handleArchive = (id: string) => {
    updateSequence.mutate(
      { id, status: "archived" },
      {
        onSuccess: () => toast.success("Sequence archived"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <div className="flex items-center gap-2 flex-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`${basePath}/campaigns`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <AppHeaderTitle title="Drip Sequences" />
        </div>
      </AppHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Automated multi-step campaigns that send over time.
            </p>
            {workspaceId ? (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                New Sequence
              </Button>
            ) : (
              <Button size="sm" disabled title="Create from a workspace page">
                <Plus className="h-4 w-4 mr-1.5" />
                New Sequence
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-slate-900 text-white"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && sequences && sequences.length > 0 && (
            <div className="space-y-3">
              {sequences.map((seq: any) => {
                const config = STATUS_CONFIG[seq.status] || STATUS_CONFIG.draft;
                return (
                  <div key={seq.id} className="rounded-lg border bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{seq.name}</p>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bg} ${config.text}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        {seq.description && (
                          <p className="text-xs text-muted-foreground mt-1">{seq.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>
                            {seq._count.steps} step{seq._count.steps !== 1 ? "s" : ""}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {seq._count.enrollments} enrollment
                            {seq._count.enrollments !== 1 ? "s" : ""}
                          </span>
                          <span>
                            Trigger: {TRIGGER_LABELS[seq.triggerType] || seq.triggerType}
                            {seq.triggerValue ? ` (${seq.triggerValue})` : ""}
                          </span>
                          {seq.workspace?.name && <span>{seq.workspace.name}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <Link href={`${basePath}/campaigns/sequences/${seq.id}`}>
                            <Workflow className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        {seq.status !== "archived" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleArchive(seq.id)}
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {(seq.status === "draft" || seq.status === "archived") && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete sequence?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This permanently deletes "{seq.name}" and related data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(seq.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>

                    {seq.status === "active" && seq._count.enrollments > 0 && (
                      <div className="mt-3 pt-3 border-t flex justify-between items-center">
                        <p className="text-[11px] text-emerald-700 font-medium">Active</p>
                        <Link
                          href={`${basePath}/campaigns/sequences/${seq.id}?tab=detail`}
                          className="text-[11px] font-medium text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                        >
                          View Performance
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && (!sequences || sequences.length === 0) && (
            <div className="rounded-lg border p-10 text-center">
              <Workflow className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium">
                {statusFilter ? `No ${statusFilter} sequences` : "No drip sequences yet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create a sequence to automate follow-ups over time.
              </p>
              {!statusFilter && workspaceId && (
                <Button size="sm" className="mt-4" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create First Sequence
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {workspaceId && (
        <SequenceCreateDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          workspaceId={workspaceId}
          basePath={basePath}
        />
      )}
    </div>
  );
}
