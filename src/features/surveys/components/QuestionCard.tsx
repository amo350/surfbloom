"use client";

import {
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  BarChart3,
  Star,
  CheckSquare,
  AlignLeft,
  ThumbsUp,
  GitBranch,
} from "lucide-react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; bg: string; text: string }
> = {
  nps: {
    icon: <BarChart3 className="h-3 w-3" />,
    label: "0-10 Scale",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  star: {
    icon: <Star className="h-3 w-3" />,
    label: "Star Rating",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  multiple_choice: {
    icon: <CheckSquare className="h-3 w-3" />,
    label: "Multiple Choice",
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
  free_text: {
    icon: <AlignLeft className="h-3 w-3" />,
    label: "Free Text",
    bg: "bg-slate-50",
    text: "text-slate-600",
  },
  yes_no: {
    icon: <ThumbsUp className="h-3 w-3" />,
    label: "Yes / No",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
};

interface QuestionCardProps {
  question: {
    id: string;
    order: number;
    type: string;
    text: string;
    required: boolean;
    options: string[] | null;
    displayCondition?: unknown;
  };
  isFirst: boolean;
  isLast: boolean;
  editable: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  dragHandleProps?: {
    attributes: DraggableAttributes;
    listeners: DraggableSyntheticListeners | undefined;
  };
}

export function QuestionCard({
  question,
  isFirst,
  isLast,
  editable,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  dragHandleProps,
}: QuestionCardProps) {
  const config = TYPE_CONFIG[question.type] || TYPE_CONFIG.free_text;
  const options = question.options as string[] | null;

  return (
    <div className="border rounded-lg bg-white hover:shadow-sm transition-shadow group">
      <div className="px-4 py-3 flex items-start gap-3">
        {/* Order badge */}
        <div
          className="flex flex-col items-center gap-1 shrink-0 pt-0.5"
          {...(dragHandleProps?.attributes || {})}
          {...(dragHandleProps?.listeners || {})}
        >
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted/40 text-xs font-bold text-muted-foreground">
            {question.order}
          </div>

          {/* Move arrows */}
          {editable && (
            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={onMoveUp}
                disabled={isFirst}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={onMoveDown}
                disabled={isLast}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{question.text}</p>

          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bg} ${config.text}`}
            >
              {config.icon}
              {config.label}
            </span>
            {Boolean(question.displayCondition) && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-600">
                <GitBranch className="h-2.5 w-2.5" />
                Conditional
              </span>
            )}

            {question.required && (
              <span className="text-[10px] text-red-400 font-medium">
                Required
              </span>
            )}
          </div>

          {/* Options preview for multiple choice */}
          {question.type === "multiple_choice" &&
            options &&
            options.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {options.map((opt) => (
                  <span
                    key={opt}
                    className="px-2 py-0.5 rounded-full text-[10px] bg-purple-50 text-purple-600 border border-purple-100"
                  >
                    {opt}
                  </span>
                ))}
              </div>
            )}
        </div>

        {/* Actions */}
        {editable && (
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
            >
              <Pencil className="h-3 w-3" />
            </Button>

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
                  <AlertDialogTitle>Delete question?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove question {question.order} and reorder the
                    remaining questions.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
}

interface SortableQuestionCardProps extends QuestionCardProps {
  id: string;
}

export function SortableQuestionCard({
  id,
  ...props
}: SortableQuestionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "z-20" : undefined}>
      <QuestionCard
        {...props}
        dragHandleProps={{
          attributes,
          listeners,
        }}
      />
    </div>
  );
}
