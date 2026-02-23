"use client";

import { ReactNode } from "react";
import {
  BarChart3,
  Star,
  CheckSquare,
  AlignLeft,
  ThumbsUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useQuestionBreakdown } from "../hooks/use-surveys";

const TYPE_ICON: Record<string, ReactNode> = {
  nps: <BarChart3 className="h-3.5 w-3.5 text-blue-500" />,
  star: <Star className="h-3.5 w-3.5 text-amber-500" />,
  multiple_choice: <CheckSquare className="h-3.5 w-3.5 text-purple-500" />,
  free_text: <AlignLeft className="h-3.5 w-3.5 text-slate-500" />,
  yes_no: <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />,
};

function npsColor(value: number): string {
  if (value >= 9) return "#10b981";
  if (value >= 7) return "#f59e0b";
  return "#ef4444";
}

function starColor(value: number): string {
  const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981"];
  return colors[Math.max(0, Math.min(4, value - 1))];
}

interface QuestionBreakdownProps {
  surveyId: string;
}

export function QuestionBreakdown({ surveyId }: QuestionBreakdownProps) {
  const { data: questions, isLoading } = useQuestionBreakdown(surveyId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Per-Question Breakdown</h3>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border rounded-lg bg-white p-4 animate-pulse">
            <div className="flex items-start gap-2 mb-3">
              <div className="h-6 w-6 rounded-full bg-muted/40 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-4/5 rounded bg-muted/40" />
                <div className="h-2.5 w-1/3 rounded bg-muted/30" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 rounded bg-muted/30" />
              <div className="h-4 rounded bg-muted/30 w-5/6" />
              <div className="h-4 rounded bg-muted/30 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No question data yet
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Per-Question Breakdown</h3>
      {questions.map((q: any) => (
        <QuestionChart key={q.id} question={q} />
      ))}
    </div>
  );
}

function QuestionChart({ question }: { question: any }) {
  const icon = TYPE_ICON[question.type] || TYPE_ICON.free_text;

  return (
    <div className="border rounded-lg bg-white p-4">
      <div className="flex items-start gap-2 mb-3">
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted/30 text-xs font-bold text-muted-foreground shrink-0">
          {question.order}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{question.text}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {icon}
              {question.total} response{question.total !== 1 ? "s" : ""}
            </span>
            {question.avg != null && question.type !== "yes_no" && (
              <span className="text-[10px] text-muted-foreground">
                Avg: {question.avg.toFixed(1)}
              </span>
            )}
            {question.type === "yes_no" && question.avg != null && (
              <span className="text-[10px] text-muted-foreground">
                {question.avg.toFixed(0)}% yes
              </span>
            )}
          </div>
        </div>
      </div>

      {question.total === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No responses yet
        </p>
      ) : question.type === "free_text" ? (
        <FreeTextSamples samples={question.samples || []} total={question.total} />
      ) : question.type === "nps" ? (
        <NpsChart data={question.distribution} />
      ) : question.type === "star" ? (
        <StarChart data={question.distribution} />
      ) : question.type === "multiple_choice" ? (
        <ChoiceChart data={question.distribution} total={question.total} />
      ) : question.type === "yes_no" ? (
        <YesNoBar data={question.distribution} total={question.total} />
      ) : null}
    </div>
  );
}

function NpsChart({ data }: { data: { value: number; count: number }[] }) {
  return (
    <div className="h-[140px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={20}>
          <XAxis
            dataKey="value"
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value: number) => [`${value} responses`, "Count"]}
            labelFormatter={(label) => `Score: ${label}`}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.value} fill={npsColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function StarChart({
  data,
}: {
  data: { value: number; count: number; label: string }[];
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-1.5">
      {[...data].reverse().map((d) => (
        <div key={d.value} className="flex items-center gap-2">
          <span className="text-xs font-medium w-12 text-right shrink-0">
            {d.value} star{d.value > 1 ? "s" : ""}
          </span>
          <div className="flex-1 h-5 bg-muted/20 rounded overflow-hidden">
            <div
              className="h-full rounded transition-all"
              style={{
                width: `${maxCount > 0 ? (d.count / maxCount) * 100 : 0}%`,
                backgroundColor: starColor(d.value),
              }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground w-8 shrink-0">
            {d.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChoiceChart({
  data,
  total,
}: {
  data: { value: string; count: number; label: string }[];
  total: number;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-1.5">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs w-28 truncate text-right shrink-0" title={d.label}>
            {d.label}
          </span>
          <div className="flex-1 h-5 bg-muted/20 rounded overflow-hidden">
            <div
              className="h-full rounded bg-purple-400 transition-all"
              style={{
                width: `${maxCount > 0 ? (d.count / maxCount) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground w-14 shrink-0">
            {d.count} ({total > 0 ? ((d.count / total) * 100).toFixed(0) : 0}%)
          </span>
        </div>
      ))}
    </div>
  );
}

function YesNoBar({
  data,
  total,
}: {
  data: { value: string; count: number }[];
  total: number;
}) {
  const yes = data.find((d) => d.value === "Yes")?.count || 0;
  const no = data.find((d) => d.value === "No")?.count || 0;

  return (
    <div>
      <div className="h-6 rounded-full overflow-hidden flex bg-muted/20">
        {yes > 0 && (
          <div
            className="h-full bg-emerald-400 flex items-center justify-center text-[10px] font-medium text-white transition-all"
            style={{ width: `${total > 0 ? (yes / total) * 100 : 0}%` }}
          >
            {yes > 0 && total > 3 ? `${((yes / total) * 100).toFixed(0)}%` : ""}
          </div>
        )}
        {no > 0 && (
          <div
            className="h-full bg-red-400 flex items-center justify-center text-[10px] font-medium text-white transition-all"
            style={{ width: `${total > 0 ? (no / total) * 100 : 0}%` }}
          >
            {no > 0 && total > 3 ? `${((no / total) * 100).toFixed(0)}%` : ""}
          </div>
        )}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-emerald-600 font-medium">Yes: {yes}</span>
        <span className="text-[10px] text-red-600 font-medium">No: {no}</span>
      </div>
    </div>
  );
}

function FreeTextSamples({
  samples,
  total,
}: {
  samples: string[];
  total: number;
}) {
  if (samples.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-2">
        No text responses yet
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {samples.slice(0, 5).map((text, i) => (
        <div
          key={i}
          className="px-3 py-2 rounded bg-muted/10 border text-xs text-foreground"
        >
          "{text}"
        </div>
      ))}
      {total > 5 && (
        <p className="text-[10px] text-muted-foreground text-center">
          + {total - 5} more responses
        </p>
      )}
    </div>
  );
}
