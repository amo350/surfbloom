"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Play,
  Pencil,
  Copy,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  BookmarkPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { toast } from "sonner";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import {
  useSurvey,
  useUpdateSurvey,
  useDeleteQuestion,
  useReorderQuestions,
  useSaveAsTemplate,
} from "../hooks/use-surveys";
import { SortableQuestionCard } from "./QuestionCard";
import { QuestionEditor } from "./QuestionEditor";
import { SurveySettingsPanel } from "./SurveySettingsPanel";
import { SurveyStats } from "./SurveyStats";
import { ResponseTable } from "./ResponseTable";
import { QuestionBreakdown } from "./QuestionBreakdown";
import { ScoreDistribution } from "./ScoreDistribution";
import { useTRPC } from "@/trpc/client";
import { NpsTrendChart } from "./NpsTrendChart";
import { LocationNpsChart } from "./LocationNpsChart";

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
  listPath: string;
}

export function SurveyBuilder({ surveyId, listPath }: SurveyBuilderProps) {
  const [tab, setTab] = useState<Tab>("Questions");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const { data: survey, isLoading } = useSurvey(surveyId);
  const updateSurvey = useUpdateSurvey();
  const deleteQuestion = useDeleteQuestion();
  const reorderQuestions = useReorderQuestions();
  const saveAsTemplate = useSaveAsTemplate();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

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

  const copyToClipboard = (value: string, successMessage: string) => {
    const fallbackCopy = () => {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      return copied;
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(value)
        .then(() => toast.success(successMessage))
        .catch(() => {
          const copied = fallbackCopy();
          if (copied) toast.success(successMessage);
          else toast.error("Unable to copy");
        });
      return;
    }

    const copied = fallbackCopy();
    if (copied) toast.success(successMessage);
    else toast.error("Unable to copy");
  };

  const copyToken = () => {
    copyToClipboard(
      "{survey_link}",
      "Copied {survey_link} token for campaign message",
    );
  };

  const copyScopedToken = () => {
    if (!survey) return;
    copyToClipboard(
      `{survey_link:${survey.slug}}`,
      "Copied survey-specific token",
    );
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }

    saveAsTemplate.mutate(
      {
        surveyId,
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Survey template saved");
          setSaveTemplateOpen(false);
          setTemplateName("");
          setTemplateDescription("");
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to save template");
        },
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
  const sortedQuestions = [...survey.questions].sort(
    (a: any, b: any) => a.order - b.order,
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedQuestions.findIndex((q: any) => q.id === active.id);
    const newIndex = sortedQuestions.findIndex((q: any) => q.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(sortedQuestions, oldIndex, newIndex);
    reorderQuestions.mutate({
      surveyId,
      questionIds: reordered.map((q: any) => q.id),
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <AppHeader>
        <div className="flex items-center gap-3 flex-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={listPath}>
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
          {/* Copy token */}
          <Button variant="ghost" size="sm" onClick={copyToken}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy Token
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSaveTemplateOpen(true)}>
            <BookmarkPlus className="h-3.5 w-3.5 mr-1.5" />
            Save as Template
          </Button>

          {/* Preview */}
          <Button variant="ghost" size="sm" asChild>
            <a
              href={`/s/${survey.slug}?preview=true`}
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
          <div className="max-w-3xl mx-auto space-y-4">
            {survey.questions.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedQuestions.map((q: any) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedQuestions.map((question: any, index: number) => (
                    <SortableQuestionCard
                      key={question.id}
                      id={question.id}
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
                  ))}
                </SortableContext>
              </DndContext>
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
              <div className="pt-4 mt-4 border-t space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    Campaign token (selected survey in campaign):
                  </span>
                  <code className="text-[10px] bg-muted/30 px-2 py-1 rounded font-mono">
                    {"{survey_link}"}
                  </code>
                  <Button variant="ghost" size="sm" className="h-6" onClick={copyToken}>
                    <Copy className="h-2.5 w-2.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    Survey-specific token:
                  </span>
                  <code className="text-[10px] bg-muted/30 px-2 py-1 rounded font-mono">
                    {`{survey_link:${survey.slug}}`}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6"
                    onClick={copyScopedToken}
                  >
                    <Copy className="h-2.5 w-2.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground/70">
                  Use tokens in campaigns. We generate unique per-recipient links
                  with contact/workspace IDs. Use the survey-specific token when
                  you want to clearly distinguish between multiple surveys.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── Settings Tab ──────────────────────────────── */}
        {tab === "Settings" && (
          <div className="max-w-lg mx-auto">
            <SurveySettingsPanel survey={survey} />
          </div>
        )}

        {/* ─── Responses Tab ─────────────────────────────── */}
        {tab === "Responses" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <SurveyStats surveyId={surveyId} />
            <AiSummaryCard surveyId={surveyId} />
            <ScoreDistribution surveyId={surveyId} />
            <QuestionBreakdown surveyId={surveyId} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <NpsTrendChart surveyId={surveyId} />
              <LocationNpsChart surveyId={surveyId} />
            </div>
            <ResponseTable surveyId={surveyId} questions={survey.questions} />
          </div>
        )}
      </div>

      {/* Question editor dialog */}
      <QuestionEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        surveyId={surveyId}
        surveyQuestions={survey.questions}
        question={editingQuestion}
      />

      <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Survey as Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Template Name
              </label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. Post-Visit NPS + Follow-up"
                className="h-9"
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Description (optional)
              </label>
              <Textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="What this template is best used for"
                rows={2}
                className="resize-none text-sm"
                maxLength={500}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSaveTemplateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveTemplate}
                disabled={saveAsTemplate.isPending || !templateName.trim()}
              >
                {saveAsTemplate.isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                )}
                Save Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AiSummaryCard({ surveyId }: { surveyId: string }) {
  const trpc = useTRPC();
  const [summary, setSummary] = useState<string | null>(null);
  const [responsesAnalyzed, setResponsesAnalyzed] = useState<number | null>(null);

  const generate = useMutation(
    trpc.surveys.generateSummary.mutationOptions({
      onSuccess: (data) => {
        setSummary(data.summary);
        setResponsesAnalyzed(data.responsesAnalyzed);
      },
      onError: (err) => {
        toast.error(err?.message || "Failed to generate summary");
      },
    }),
  );

  return (
    <div className="border rounded-lg bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <h4 className="text-sm font-semibold">AI Summary</h4>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => generate.mutate({ surveyId })}
          disabled={generate.isPending}
        >
          {generate.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          )}
          {summary ? "Regenerate" : "Generate Summary"}
        </Button>
      </div>

      {summary ? (
        <div className="space-y-2">
          {responsesAnalyzed != null && (
            <p className="text-[11px] text-muted-foreground">
              Based on {responsesAnalyzed} free-text responses
            </p>
          )}
          <div className="prose prose-sm max-w-none text-sm text-foreground whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Analyze all free-text responses to identify common themes and insights
        </p>
      )}
    </div>
  );
}
