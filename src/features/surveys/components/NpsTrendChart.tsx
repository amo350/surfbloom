"use client";

import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useNpsTrend } from "../hooks/use-surveys";

interface NpsTrendChartProps {
  surveyId?: string;
  workspaceId?: string;
  days?: number;
}

export function NpsTrendChart({
  surveyId,
  workspaceId,
  days = 90,
}: NpsTrendChartProps) {
  const { data, isLoading } = useNpsTrend(surveyId, workspaceId, days);

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-white p-4 flex justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.length < 2) return null;

  return (
    <div className="border rounded-lg bg-white p-4">
      <h4 className="text-sm font-semibold mb-3">NPS Over Time</h4>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                const d = new Date(value);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis
              domain={[-100, 100]}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(value: number) => [`${value}`, "NPS"]}
              labelFormatter={(label) => `Week of ${label}`}
            />
            <ReferenceLine y={0} stroke="#e2e8f0" strokeDasharray="4 4" />
            <ReferenceLine
              y={50}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeOpacity={0.3}
            />
            <Line
              type="monotone"
              dataKey="nps"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3, fill: "#3b82f6" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-2">
        <span className="text-[9px] text-muted-foreground">
          Latest:{" "}
          <span className="font-semibold text-foreground">
            {data[data.length - 1].nps}
          </span>
        </span>
        <span className="text-[9px] text-muted-foreground">
          {data.reduce((sum, datum) => sum + datum.responses, 0)} total responses
        </span>
      </div>
    </div>
  );
}
