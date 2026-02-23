"use client";

import {
  Loader2,
  Users,
  Star,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useSurveyStats } from "../hooks/use-surveys";

interface SurveyStatsProps {
  surveyId: string;
}

export function SurveyStats({ surveyId }: SurveyStatsProps) {
  const { data: stats, isLoading } = useSurveyStats(surveyId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) return null;

  const completionRate =
    stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(0) : "—";

  return (
    <div className="space-y-4">
      {/* Hero cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <HeroCard
          label="Total Sent"
          value={stats.total}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <HeroCard
          label="Completed"
          value={stats.completed}
          icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
          color="text-emerald-600"
        />
        <HeroCard
          label="Avg Score"
          value={stats.avgScore != null ? stats.avgScore.toFixed(1) : "—"}
          icon={<Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
          color="text-amber-600"
        />
        <HeroCard
          label="NPS"
          value={
            stats.nps != null ? `${stats.nps > 0 ? "+" : ""}${stats.nps}` : "—"
          }
          icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
          color={
            stats.nps != null
              ? stats.nps >= 50
                ? "text-emerald-600"
                : stats.nps >= 0
                  ? "text-blue-600"
                  : "text-red-600"
              : "text-muted-foreground"
          }
        />
        <HeroCard
          label="Completion"
          value={completionRate === "—" ? "—" : `${completionRate}%`}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* NPS breakdown bar */}
      {stats.nps != null && (
        <div className="border rounded-lg p-4 bg-white">
          <h4 className="text-xs font-semibold mb-3">NPS Breakdown</h4>

          <div className="h-3 rounded-full overflow-hidden flex bg-muted/20">
            {stats.promoters > 0 && (
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{
                  width: `${(stats.promoters / (stats.promoters + stats.passives + stats.detractors)) * 100}%`,
                }}
                title={`Promoters: ${stats.promoters}`}
              />
            )}
            {stats.passives > 0 && (
              <div
                className="h-full bg-amber-400 transition-all"
                style={{
                  width: `${(stats.passives / (stats.promoters + stats.passives + stats.detractors)) * 100}%`,
                }}
                title={`Passives: ${stats.passives}`}
              />
            )}
            {stats.detractors > 0 && (
              <div
                className="h-full bg-red-400 transition-all"
                style={{
                  width: `${(stats.detractors / (stats.promoters + stats.passives + stats.detractors)) * 100}%`,
                }}
                title={`Detractors: ${stats.detractors}`}
              />
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] font-medium text-emerald-600">
              Promoters: {stats.promoters} ({npsPercent(stats.promoters, stats)}
              %)
            </span>
            <span className="text-[10px] font-medium text-amber-600">
              Passives: {stats.passives} ({npsPercent(stats.passives, stats)}%)
            </span>
            <span className="text-[10px] font-medium text-red-600">
              Detractors: {stats.detractors} (
              {npsPercent(stats.detractors, stats)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function npsPercent(
  count: number,
  stats: { promoters: number; passives: number; detractors: number },
): string {
  const total = stats.promoters + stats.passives + stats.detractors;
  if (total === 0) return "0";
  return ((count / total) * 100).toFixed(0);
}

function HeroCard({
  label,
  value,
  icon,
  color = "text-foreground",
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="border rounded-lg p-3 bg-white">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
