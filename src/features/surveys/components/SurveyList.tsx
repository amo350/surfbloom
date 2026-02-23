"use client";

import { useState } from "react";
import {
  Plus,
  Loader2,
  ClipboardList,
  Archive,
  Trash2,
  Star,
} from "lucide-react";
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
import { toast } from "sonner";
import Link from "next/link";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import {
  useSurveys,
  useUpdateSurvey,
  useDeleteSurvey,
} from "../hooks/use-surveys";
import { SurveyCreateDialog } from "./SurveyCreateDialog";

const STATUS_FILTERS = [
  { value: undefined, label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
] as const;

type SurveyStatusFilter = (typeof STATUS_FILTERS)[number]["value"];

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  draft: { bg: "bg-slate-100", text: "text-slate-600", label: "Draft" },
  active: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Active" },
  archived: { bg: "bg-red-100", text: "text-red-700", label: "Archived" },
};

type DeleteSurveyResult = {
  id: string;
  status?: "archived" | "deleted" | string;
};

export function SurveyList() {
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SurveyStatusFilter>(undefined);

  const { data: surveys, isLoading } = useSurveys(statusFilter);
  const updateSurvey = useUpdateSurvey();
  const deleteSurvey = useDeleteSurvey();

  const handleArchive = (id: string) => {
    updateSurvey.mutate(
      { id, status: "archived" },
      {
        onSuccess: () => toast.success("Survey archived"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteSurvey.mutate(
      { id },
      {
        onSuccess: (result: DeleteSurveyResult) => {
          if (result?.status === "archived") {
            toast.success("Survey has responses, so it was archived");
          } else {
            toast.success("Survey deleted");
          }
        },
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <AppHeaderTitle title="Surveys" />
        <Button
          size="sm"
          className="ml-auto"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Survey
        </Button>
      </AppHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status pills */}
        <div className="flex gap-1.5">
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
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && surveys && surveys.length > 0 && (
          <div className="space-y-3">
            {surveys.map((survey: any) => {
              const config =
                STATUS_CONFIG[survey.status] || STATUS_CONFIG.draft;

              return (
                <div
                  key={survey.id}
                  className="border rounded-lg hover:shadow-sm transition-shadow group bg-white"
                >
                  <div className="px-4 py-3 flex items-start justify-between gap-3">
                    {/* Left */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/index/surveys/${survey.id}`}
                          className="text-sm font-medium hover:text-teal-600 transition-colors truncate"
                        >
                          {survey.name}
                        </Link>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${config.bg} ${config.text}`}
                        >
                          {config.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          {survey._count.questions} question
                          {survey._count.questions !== 1 ? "s" : ""}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {survey.stats.completed} response
                          {survey.stats.completed !== 1 ? "s" : ""}
                        </span>
                        {survey.stats.avgScore != null && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                            {survey.stats.avgScore.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right - actions */}
                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {survey.status !== "archived" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleArchive(survey.id)}
                        >
                          <Archive className="h-3 w-3" />
                        </Button>
                      )}

                      {(survey.status === "draft" ||
                        (survey.status === "archived" &&
                          survey._count.enrollments === 0)) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete survey?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{survey.name}" and
                                all its questions.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(survey.id)}
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
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && (!surveys || surveys.length === 0) && (
          <div className="flex flex-col items-center py-16 text-center">
            <ClipboardList className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {statusFilter ? `No ${statusFilter} surveys` : "No surveys yet"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
              Create a survey to collect customer feedback, measure NPS, and
              route happy customers to leave reviews
            </p>
            {!statusFilter && (
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create First Survey
              </Button>
            )}
          </div>
        )}
      </div>

      <SurveyCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
