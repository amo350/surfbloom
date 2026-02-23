"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAddQuestion, useUpdateQuestion } from "../hooks/use-surveys";

const QUESTION_TYPES = [
  { value: "nps", label: "NPS (0-10 Scale)" },
  { value: "star", label: "Star Rating (1-5)" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "free_text", label: "Free Text" },
  { value: "yes_no", label: "Yes / No" },
] as const;

type QuestionType = (typeof QUESTION_TYPES)[number]["value"];
type ConditionOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in";

type DisplayCondition = {
  questionId: string;
  operator: ConditionOperator;
  value: number | string | string[];
};

interface QuestionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyId: string;
  surveyQuestions: Array<{
    id: string;
    order: number;
    text: string;
  }>;
  question?: {
    id: string;
    order: number;
    type: QuestionType;
    text: string;
    required: boolean;
    options: string[] | null;
    displayCondition?: DisplayCondition | null;
  } | null;
}

export function QuestionEditor({
  open,
  onOpenChange,
  surveyId,
  surveyQuestions,
  question,
}: QuestionEditorProps) {
  const isEditing = !!question;

  const [type, setType] = useState<QuestionType>("nps");
  const [text, setText] = useState("");
  const [required, setRequired] = useState(true);
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [hasCondition, setHasCondition] = useState(false);
  const [condition, setCondition] = useState<DisplayCondition | null>(null);

  const addQuestion = useAddQuestion();
  const updateQuestion = useUpdateQuestion();
  const previousQuestions = surveyQuestions
    .filter((q) => q.order < (question?.order ?? Number.POSITIVE_INFINITY))
    .sort((a, b) => a.order - b.order);

  // Populate when editing
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: include `open` intentionally to reset form state when dialog visibility changes
  useEffect(() => {
    if (question) {
      setType(question.type);
      setText(question.text);
      setRequired(question.required);
      setOptions(question.options || []);
      setHasCondition(!!question.displayCondition);
      setCondition((question.displayCondition as DisplayCondition | null) ?? null);
    } else {
      setType("nps");
      setText("");
      setRequired(true);
      setOptions([]);
      setHasCondition(false);
      setCondition(null);
    }
    setNewOption("");
  }, [question, open]);

  const handleAddOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    if (options.includes(trimmed)) {
      toast.error("Option already exists");
      return;
    }
    if (options.length >= 10) {
      toast.error("Maximum 10 options");
      return;
    }
    setOptions([...options, trimmed]);
    setNewOption("");
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!text.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (type === "multiple_choice" && options.length < 2) {
      toast.error("Multiple choice needs at least 2 options");
      return;
    }

    if (hasCondition) {
      const conditionQuestionId = condition?.questionId?.trim() || "";
      if (!conditionQuestionId) {
        toast.error("Pick a question for the display condition");
        return;
      }
      if (condition?.value == null || condition.value === "") {
        toast.error("Enter a value for the display condition");
        return;
      }
    }

    const formattedCondition =
      hasCondition && condition
        ? {
            questionId: condition.questionId,
            operator: condition.operator,
            value:
              condition.operator === "in"
                ? Array.isArray(condition.value)
                  ? condition.value
                  : String(condition.value)
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean)
                : condition.value,
          }
        : null;

    if (isEditing && question) {
      updateQuestion.mutate(
        {
          id: question.id,
          type,
          text: text.trim(),
          required,
          options: type === "multiple_choice" ? options : null,
          displayCondition: formattedCondition,
        },
        {
          onSuccess: () => {
            toast.success("Question updated");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err?.message || "Failed"),
        },
      );
    } else {
      addQuestion.mutate(
        {
          surveyId,
          type,
          text: text.trim(),
          required,
          options: type === "multiple_choice" ? options : undefined,
          displayCondition: formattedCondition,
        },
        {
          onSuccess: () => {
            toast.success("Question added");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err?.message || "Failed"),
        },
      );
    }
  };

  const isPending = addQuestion.isPending || updateQuestion.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Question" : "Add Question"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Type select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Question Type
            </label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as QuestionType)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((qt) => (
                  <SelectItem key={qt.value} value={qt.value}>
                    {qt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question text */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Question
            </label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                type === "nps"
                  ? "How likely are you to recommend us to a friend?"
                  : type === "star"
                    ? "How would you rate your experience?"
                    : type === "yes_no"
                      ? "Would you visit us again?"
                      : "Enter your question..."
              }
              className="h-9"
              maxLength={500}
            />
          </div>

          {/* Multiple choice options */}
          {type === "multiple_choice" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Options ({options.length}/10)
              </label>

              <div className="space-y-1.5">
                {options.map((opt, i) => (
                  <div
                    key={opt}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/20 border"
                  >
                    <span className="text-sm flex-1">{opt}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveOption(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddOption())
                  }
                  placeholder="Add option..."
                  className="h-8 text-sm"
                  maxLength={100}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={handleAddOption}
                  disabled={!newOption.trim() || options.length >= 10}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Required toggle */}
          <div className="flex items-center justify-between py-1">
            <label className="text-xs font-medium text-muted-foreground">
              Required
            </label>
            <Switch checked={required} onCheckedChange={setRequired} />
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Display Condition
              </label>
              <Switch
                checked={hasCondition}
                onCheckedChange={(checked) => {
                  setHasCondition(checked);
                  if (!checked) {
                    setCondition(null);
                    return;
                  }
                  setCondition((prev) => {
                    if (prev) return prev;
                    return {
                      questionId: previousQuestions[0]?.id || "",
                      operator: "gte",
                      value: "",
                    };
                  });
                }}
              />
            </div>

            {hasCondition && (
              <div className="space-y-2 p-3 rounded-lg bg-muted/10 border">
                <p className="text-[10px] text-muted-foreground">
                  Only show this question when:
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={condition?.questionId || ""}
                    onValueChange={(value) =>
                      setCondition((prev) => ({
                        ...(prev || {
                          questionId: "",
                          operator: "gte",
                          value: "",
                        }),
                        questionId: value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Question..." />
                    </SelectTrigger>
                    <SelectContent>
                      {previousQuestions.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {`Q${q.order}: ${q.text.slice(0, 30)}${q.text.length > 30 ? "..." : ""}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition?.operator || "gte"}
                    onValueChange={(value) =>
                      setCondition((prev) => ({
                        ...(prev || {
                          questionId: "",
                          operator: "gte",
                          value: "",
                        }),
                        operator: value as ConditionOperator,
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eq">equals</SelectItem>
                      <SelectItem value="neq">not equals</SelectItem>
                      <SelectItem value="gt">greater than</SelectItem>
                      <SelectItem value="gte">at least</SelectItem>
                      <SelectItem value="lt">less than</SelectItem>
                      <SelectItem value="lte">at most</SelectItem>
                      <SelectItem value="in">is one of</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={
                      Array.isArray(condition?.value)
                        ? condition?.value.join(", ")
                        : (condition?.value ?? "")
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      const parsed = /^\d+$/.test(raw) ? parseInt(raw, 10) : raw;
                      setCondition((prev) => ({
                        ...(prev || {
                          questionId: "",
                          operator: "gte",
                          value: "",
                        }),
                        value: parsed,
                      }));
                    }}
                    placeholder="Value..."
                    className="h-8 text-xs"
                  />
                </div>
                {previousQuestions.length === 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    Add earlier questions first to set conditions.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Type hint */}
          <p className="text-[10px] text-muted-foreground">
            {type === "nps" &&
              "Respondent picks a number 0-10. Scores 9-10 = Promoter, 7-8 = Passive, 0-6 = Detractor."}
            {type === "star" &&
              "Respondent picks 1-5 stars. Averaged for overall score."}
            {type === "multiple_choice" &&
              "Respondent picks one of the options you define."}
            {type === "free_text" &&
              "Open-ended text response. Not included in numeric scoring."}
            {type === "yes_no" &&
              "Simple yes or no. Yes = 10, No = 0 for scoring purposes."}
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              {isEditing ? "Save Changes" : "Add Question"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}