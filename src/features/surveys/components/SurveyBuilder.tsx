"use client";

import { useState } from "react";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Play,
  Pencil,
  Copy,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import {
  useSurvey,
  useUpdateSurvey,
  useDeleteQuestion,
  useReorderQuestions,
} from "../hooks/use-surveys";
import { QuestionCard } from "./QuestionCard";
import { QuestionEditor } from "./QuestionEditor";
import { SurveySettingsPanel } from "./SurveySettingsPanel";
import { SurveyStats } from "./SurveyStats";
import { ResponseTable } from "./ResponseTable";
import { QuestionBreakdown } from "./QuestionBreakdown";
import { ScoreDistribution } from "./ScoreDistribution";

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  draft: { bg: "bg-slate-100", text: "text-slate-600", label: "Draft" },
  active: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Active" },
  archived: { bg: "bg-red-100", text: "text-red-700", label: "Archived" },
};

const TABS = ["Questions", "Settings", "Responses"] as const;
type Tab = (typeof TABS)[number];

interface SurveyBuilderProps {
  surveyId: string;
}

export function SurveyBuilder({ surveyId }: SurveyBuilderProps) {
  const [tab, setTab] = useState<Tab>("Questions");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const { data: survey, isLoading } = useSurvey(surveyId);
  const updateSurvey = useUpdateSurvey();
  const deleteQuestion = useDeleteQuestion();
  const reorderQuestions = useReorderQuestions();

  const handleActivate = () => {
    if (!survey || survey.questions.length === 0) {
      toast.error("Add at least 1 question before activating");
      return;
    }

    updateSurvey.mutate(
      { id: surveyId, status: "active" },
      {
        onSuccess: () => toast.success("Survey activated"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const handleDraft = () => {
    updateSurvey.mutate(
      { id: surveyId, status: "draft" },
      {
        onSuccess: () => toast.success("Survey set to draft"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const handleDeleteQuestion = (id: string) => {
    deleteQuestion.mutate(
      { id },
      {
        onSuccess: () => toast.success("Question deleted"),
        onError: (err) => toast.error(err?.message || "Failed"),
      },
    );
  };

  const handleMoveQuestion = (
    questionOrder: number,
    direction: "up" | "down",
  ) => {
    if (!survey) return;

    const sorted = [...survey.questions].sort((a, b) => a.order - b.order);
    const currentIndex = sorted.findIndex((q) => q.order === questionOrder);

    if (currentIndex < 0) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sorted.length - 1) return;

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    const newOrder = sorted.map((q) => q.id);
    [newOrder[currentIndex], newOrder[swapIndex]] = [
      newOrder[swapIndex],
      newOrder[currentIndex],
    ];

    reorderQuestions.mutate({ surveyId, questionIds: newOrder });
  };

  const openAddQuestion = () => {
    setEditingQuestion(null);
    setEditorOpen(true);
  };

  const openEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setEditorOpen(true);
  };

  const copyLink = () => {
    if (!survey) return;
    const url = `${window.location.origin}/s/${survey.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Survey link copied");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex flex-col items-center py-24">
        <p className="text-sm text-muted-foreground">Survey not found</p>
      </div>
    );
  }

  const config = STATUS_CONFIG[survey.status] || STATUS_CONFIG.draft;
  const editable = survey.status !== "active";
  const responseCount = survey._count.enrollments;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <AppHeader>
        <div className="flex items-center gap-3 flex-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/index/surveys">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <AppHeaderTitle title={survey.name} />
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bg} ${config.text}`}
              >
                {config.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {survey.questions.length} question
                {survey.questions.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy link */}
          <Button variant="ghost" size="sm" onClick={copyLink}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy Link
          </Button>

          {/* Preview */}
          <Button variant="ghost" size="sm" asChild>
            <a
              href={`/s/${survey.slug}?preview=true&c=test_contact&w=test_workspace&cam=test_campaign`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Preview
            </a>
          </Button>

          {/* Status toggle */}
          {survey.status === "active" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDraft}
              disabled={updateSurvey.isPending}
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Set to Draft
            </Button>
          ) : survey.status !== "archived" ? (
            <Button
              size="sm"
              onClick={handleActivate}
              disabled={updateSurvey.isPending || survey.questions.length === 0}
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Activate
            </Button>
          ) : null}
        </div>
      </AppHeader>

      {/* Active warning */}
      {survey.status === "active" && (
        <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">
            This survey is live. Set to draft to edit questions or settings.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b px-6">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
              {t === "Responses" && responseCount > 0 && (
                <span className="ml-1.5 text-[10px]">({responseCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ─── Questions Tab ─────────────────────────────── */}
        {tab === "Questions" && (
          <div className="space-y-3 max-w-2xl">
            {survey.questions.length > 0 ? (
              survey.questions
                .sort((a: any, b: any) => a.order - b.order)
                .map((question: any, index: number) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    isFirst={index === 0}
                    isLast={index === survey.questions.length - 1}
                    editable={editable}
                    onEdit={() => openEditQuestion(question)}
                    onDelete={() => handleDeleteQuestion(question.id)}
                    onMoveUp={() => handleMoveQuestion(question.order, "up")}
                    onMoveDown={() =>
                      handleMoveQuestion(question.order, "down")
                    }
                  />
                ))
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">
                  No questions yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Add your first question to start building the survey
                </p>
              </div>
            )}

            {/* Add question button */}
            {editable && (
              <button
                type="button"
                onClick={openAddQuestion}
                className="w-full border-2 border-dashed rounded-lg py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:border-teal-300 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            )}

            {/* Survey link */}
            {survey.questions.length > 0 && (
              <div className="flex items-center gap-2 pt-4 mt-4 border-t">
                <span className="text-[10px] text-muted-foreground">
                  Public link:
                </span>
                <code className="text-[10px] bg-muted/30 px-2 py-1 rounded font-mono">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/s/${survey.slug}`
                    : `/s/${survey.slug}`}
                </code>
                <Button variant="ghost" size="sm" onClick={copyLink}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ─── Settings Tab ──────────────────────────────── */}
        {tab === "Settings" && <SurveySettingsPanel survey={survey} />}

        {/* ─── Responses Tab ─────────────────────────────── */}
        {tab === "Responses" && (
          <div className="space-y-6">
            <SurveyStats surveyId={surveyId} />
            <ScoreDistribution surveyId={surveyId} />
            <QuestionBreakdown surveyId={surveyId} />
            <ResponseTable surveyId={surveyId} questions={survey.questions} />
          </div>
        )}
      </div>

      {/* Question editor dialog */}
      <QuestionEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        surveyId={surveyId}
        question={editingQuestion}
      />
    </div>
  );
}
