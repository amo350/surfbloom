"use client";

import { useState } from "react";
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSurveyResponses } from "../hooks/use-surveys";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="h-3 w-3 text-emerald-500" />,
  in_progress: <Clock className="h-3 w-3 text-blue-500" />,
  timed_out: <XCircle className="h-3 w-3 text-amber-500" />,
};

const NPS_CONFIG: Record<string, { bg: string; text: string }> = {
  promoter: { bg: "bg-emerald-50", text: "text-emerald-600" },
  passive: { bg: "bg-amber-50", text: "text-amber-600" },
  detractor: { bg: "bg-red-50", text: "text-red-600" },
};

interface ResponseTableProps {
  surveyId: string;
  questions: { id: string; order: number; text: string; type: string }[];
}

export function ResponseTable({ surveyId, questions }: ResponseTableProps) {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useSurveyResponses(surveyId, undefined, page);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.enrollments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No responses yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="border rounded-lg divide-y bg-white">
        {data.enrollments.map((enrollment: any) => {
          const contact = enrollment.contact;
          const displayName =
            [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
            contact.phone ||
            contact.email ||
            "Unknown";
          const isExpanded = expandedId === enrollment.id;
          const npsConfig = enrollment.npsCategory
            ? NPS_CONFIG[enrollment.npsCategory]
            : null;

          return (
            <div key={enrollment.id}>
              {/* Row */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : enrollment.id)}
                className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-muted/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}

                  {STATUS_ICONS[enrollment.status] || STATUS_ICONS.completed}

                  <span className="text-sm font-medium truncate">
                    {displayName}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {enrollment.score != null && (
                    <span className="text-sm font-semibold">
                      {enrollment.score % 1 === 0
                        ? enrollment.score
                        : enrollment.score.toFixed(1)}
                      /10
                    </span>
                  )}

                  {npsConfig && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${npsConfig.bg} ${npsConfig.text}`}
                    >
                      {enrollment.npsCategory}
                    </span>
                  )}

                  {enrollment.workspace && (
                    <span className="text-[10px] text-muted-foreground">
                      {enrollment.workspace.name}
                    </span>
                  )}

                  <span className="text-[10px] text-muted-foreground">
                    {enrollment.completedAt
                      ? new Date(enrollment.completedAt).toLocaleDateString()
                      : new Date(enrollment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>

              {/* Expanded responses */}
              {isExpanded && enrollment.responses.length > 0 && (
                <div className="px-4 pb-3 pt-1 ml-10 space-y-2 border-t bg-muted/5">
                  {enrollment.responses.map((response: any) => {
                    const question = questionMap.get(response.questionId);
                    if (!question) return null;

                    const answer =
                      response.answerNumber != null
                        ? response.answerNumber
                        : response.answerChoice || response.answerText || "—";

                    return (
                      <div key={response.questionId}>
                        <p className="text-[10px] text-muted-foreground">
                          Q{question.order}: {question.text}
                        </p>
                        <p className="text-sm font-medium mt-0.5">{answer}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span className="text-[10px] text-muted-foreground">
            {page} / {totalPages} ({data.total} total)
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
