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
];

interface QuestionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyId: string;
  question?: {
    id: string;
    type: string;
    text: string;
    required: boolean;
    options: any;
  } | null;
}

export function QuestionEditor({
  open,
  onOpenChange,
  surveyId,
  question,
}: QuestionEditorProps) {
  const isEditing = !!question;

  const [type, setType] = useState("nps");
  const [text, setText] = useState("");
  const [required, setRequired] = useState(true);
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");

  const addQuestion = useAddQuestion();
  const updateQuestion = useUpdateQuestion();

  // Populate when editing
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: include `open` intentionally to reset form state when dialog visibility changes
  useEffect(() => {
    if (question) {
      setType(question.type);
      setText(question.text);
      setRequired(question.required);
      setOptions((question.options as string[]) || []);
    } else {
      setType("nps");
      setText("");
      setRequired(true);
      setOptions([]);
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

    if (isEditing && question) {
      updateQuestion.mutate(
        {
          id: question.id,
          type: type as any,
          text: text.trim(),
          required,
          options: type === "multiple_choice" ? options : null,
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
          type: type as any,
          text: text.trim(),
          required,
          options: type === "multiple_choice" ? options : undefined,
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
            <Select value={type} onValueChange={setType}>
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
                    key={i}
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