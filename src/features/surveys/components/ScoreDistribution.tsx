"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  useScoreDistribution,
  useSurveyStats,
} from "../hooks/use-surveys";

function scoreColor(value: number): string {
  if (value >= 9) return "#10b981";
  if (value >= 7) return "#f59e0b";
  if (value >= 5) return "#f97316";
  return "#ef4444";
}

interface ScoreDistributionProps {
  surveyId: string;
}

export function ScoreDistribution({ surveyId }: ScoreDistributionProps) {
  const { data: stats } = useSurveyStats(surveyId);
  const { data: responses, isLoading } = useScoreDistribution(surveyId);

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-white p-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-32 rounded bg-muted/40" />
          <div className="h-3 w-24 rounded bg-muted/30" />
        </div>
        <div className="h-[160px] rounded bg-muted/20" />
      </div>
    );
  }

  if (!responses || responses.every((r: any) => r.count === 0)) {
    return null;
  }

  const avgScore = stats?.avgScore ?? null;

  return (
    <div className="border rounded-lg bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Score Distribution</h4>
        {avgScore != null && (
          <span className="text-xs text-muted-foreground">
            Average:{" "}
            <span className="font-semibold text-foreground">
              {avgScore.toFixed(1)}
            </span>
          </span>
        )}
      </div>

      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={responses} barSize={24}>
            <XAxis
              dataKey="score"
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
              labelFormatter={(label) => `Score: ${label}/10`}
            />
            {avgScore != null && (
              <ReferenceLine
                x={Math.round(avgScore)}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                label={{
                  value: "avg",
                  position: "top",
                  fontSize: 10,
                  fill: "#94a3b8",
                }}
              />
            )}
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {responses.map((entry: any) => (
                <Cell key={entry.score} fill={scoreColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
