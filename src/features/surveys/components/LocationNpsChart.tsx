"use client";

import { Loader2 } from "lucide-react";
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
import { useLocationNps } from "../hooks/use-surveys";

function npsColor(nps: number): string {
  if (nps >= 50) return "#10b981";
  if (nps >= 0) return "#3b82f6";
  return "#ef4444";
}

interface LocationNpsChartProps {
  surveyId?: string;
  days?: number;
}

export function LocationNpsChart({
  surveyId,
  days = 90,
}: LocationNpsChartProps) {
  const { data, isLoading } = useLocationNps(surveyId, days);

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
      <h4 className="text-sm font-semibold mb-3">NPS by Location</h4>

      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barSize={18}>
            <XAxis
              type="number"
              domain={[-100, 100]}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="workspaceName"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(value: number) => [`${value}`, "NPS"]}
            />
            <ReferenceLine x={0} stroke="#e2e8f0" />
            <Bar dataKey="nps" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`${entry.workspaceId}-${index}`} fill={npsColor(entry.nps)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
