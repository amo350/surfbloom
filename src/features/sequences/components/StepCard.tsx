"use client";

import {
  MessageSquare,
  Mail,
  GripVertical,
  Pencil,
  Trash2,
  GitBranch,
  Clock,
  ChevronUp,
  ChevronDown,
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

interface StepCardProps {
  step: {
    id: string;
    order: number;
    channel: string;
    subject: string | null;
    body: string;
    delayMinutes: number;
    conditionType: string | null;
    conditionAction: string;
    sendWindowStart: string | null;
    sendWindowEnd: string | null;
    _count?: { stepLogs: number };
  };
  isFirst: boolean;
  isLast: boolean;
  isPaused: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  dragHandleProps?: any;
}

const CONDITION_LABELS: Record<string, string> = {
  replied: "If replied",
  clicked: "If clicked link",
  no_reply: "If no reply",
  opted_out: "If opted out",
};

const ACTION_LABELS: Record<string, string> = {
  continue: "→ continue",
  skip: "→ skip this step",
  stop: "→ stop sequence",
};

export function StepCard({
  step,
  isFirst,
  isLast,
  isPaused,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  dragHandleProps,
}: StepCardProps) {
  const isEmail = step.channel === "email";
  const bodyPreview = step.body.replace(/<[^>]+>/g, " ").trim();

  return (
    <div className="border rounded-lg bg-white hover:shadow-sm transition-shadow group">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b bg-muted/5">
        {isPaused && (
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        )}

        <div
          className={`flex items-center justify-center h-5 w-5 rounded-full text-white text-[10px] font-bold ${
            isEmail ? "bg-blue-500" : "bg-teal-500"
          }`}
        >
          {step.order}
        </div>

        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {isEmail ? (
            <Mail className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          ) : (
            <MessageSquare className="h-3.5 w-3.5 text-teal-500 shrink-0" />
          )}
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isEmail ? "Email" : "SMS"}
          </span>

          {step.sendWindowStart && step.sendWindowEnd && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-muted/30 text-muted-foreground ml-1">
              <Clock className="h-2.5 w-2.5" />
              {step.sendWindowStart}–{step.sendWindowEnd}
            </span>
          )}

          {step._count && step._count.stepLogs > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-50 text-emerald-600 font-medium ml-auto">
              {step._count.stepLogs} sent
            </span>
          )}
        </div>

        {isPaused && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onMoveUp}
                disabled={isFirst}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onMoveDown}
                disabled={isLast}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
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
                  <AlertDialogTitle>Delete step {step.order}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove this step and re-order the remaining steps.
                    {step._count &&
                      step._count.stepLogs > 0 &&
                      ` ${step._count.stepLogs} delivery logs will also be deleted.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Step
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="px-3 py-2.5 space-y-1.5">
        {isEmail && step.subject && (
          <p className="text-xs text-muted-foreground">
            Subject: <span className="font-medium text-foreground">{step.subject}</span>
          </p>
        )}
        <p className="text-sm text-foreground line-clamp-2">
          {bodyPreview.slice(0, 200)}
        </p>
      </div>

      {step.conditionType && (
        <div className="px-3 py-2 border-t bg-amber-50/30">
          <div className="flex items-center gap-1.5">
            <GitBranch className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] font-medium text-amber-700">
              {CONDITION_LABELS[step.conditionType] || step.conditionType}{" "}
              {ACTION_LABELS[step.conditionAction] || step.conditionAction}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}