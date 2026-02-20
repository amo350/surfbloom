"use client";

import {
  Loader2,
  BarChart3,
  Send,
  CheckCircle,
  MessageSquare,
  AlertTriangle,
  Library,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import { useTemplateStats } from "../hooks/use-templates";
import { useCampaigns } from "../hooks/use-campaigns";
import { TemplateCategoryBadge } from "./TemplateCategoryBadge";

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function CampaignReporting() {
  const { data: templateStats, isLoading: statsLoading } = useTemplateStats();
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns({});

  const isLoading = statsLoading || campaignsLoading;

  // Aggregate totals across all campaigns
  const campaigns = campaignsData?.items || [];
  const totals = campaigns.reduce(
    (acc, c: any) => {
      if (c.type === "group") return acc;
      acc.total++;
      acc.sent += c.sentCount || 0;
      acc.delivered += c.deliveredCount || 0;
      acc.failed += c.failedCount || 0;
      acc.replied += c.repliedCount || 0;
      acc.recipients += c.totalRecipients || 0;
      if (c.status === "completed") acc.completed++;
      if (c.status === "sending") acc.active++;
      return acc;
    },
    {
      total: 0,
      completed: 0,
      active: 0,
      recipients: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      replied: 0,
    },
  );

  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <AppHeaderTitle title="Campaign Reporting" />
      </AppHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Overview stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <OverviewCard
                icon={Send}
                label="Total Sent"
                value={totals.sent.toLocaleString()}
                sub={`${totals.total} campaigns`}
              />
              <OverviewCard
                icon={CheckCircle}
                label="Delivered"
                value={totals.delivered.toLocaleString()}
                sub={
                  totals.sent > 0 ? pct(totals.delivered / totals.sent) : "—"
                }
                subColor="text-emerald-600"
              />
              <OverviewCard
                icon={MessageSquare}
                label="Replied"
                value={totals.replied.toLocaleString()}
                sub={totals.sent > 0 ? pct(totals.replied / totals.sent) : "—"}
                subColor="text-teal-600"
              />
              <OverviewCard
                icon={AlertTriangle}
                label="Failed"
                value={totals.failed.toLocaleString()}
                sub={totals.sent > 0 ? pct(totals.failed / totals.sent) : "—"}
                subColor="text-red-500"
              />
            </div>

            {/* Template performance table */}
            {templateStats && templateStats.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b bg-muted/10 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Performance by Template
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/5">
                        <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">
                          Template
                        </th>
                        <th className="text-right text-[11px] font-medium text-muted-foreground px-3 py-2.5">
                          Campaigns
                        </th>
                        <th className="text-right text-[11px] font-medium text-muted-foreground px-3 py-2.5">
                          Sent
                        </th>
                        <th className="text-right text-[11px] font-medium text-muted-foreground px-3 py-2.5">
                          Delivered
                        </th>
                        <th className="text-right text-[11px] font-medium text-muted-foreground px-3 py-2.5">
                          Replied
                        </th>
                        <th className="text-right text-[11px] font-medium text-muted-foreground px-3 py-2.5">
                          Delivery %
                        </th>
                        <th className="text-right text-[11px] font-medium text-muted-foreground px-4 py-2.5">
                          Reply %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {templateStats.map((t: any, i: number) => (
                        <tr
                          key={t.id}
                          className="border-b last:border-0 hover:bg-muted/10"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {i === 0 && templateStats.length > 1 && (
                                <Trophy className="h-3 w-3 text-amber-500 shrink-0" />
                              )}
                              <span className="text-sm font-medium truncate max-w-[200px]">
                                {t.name}
                              </span>
                              {t.isLibrary && (
                                <Library className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                              )}
                              <TemplateCategoryBadge category={t.category} />
                            </div>
                            {t.abTestCount > 0 && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {t.abTestCount} A/B test
                                {t.abTestCount !== 1 ? "s" : ""} · A won{" "}
                                {t.variantAWins}x · B won {t.variantBWins}x
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right text-sm">
                            {t.campaignCount}
                          </td>
                          <td className="px-3 py-3 text-right text-sm">
                            {t.totalSent.toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-right text-sm">
                            {t.totalDelivered.toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-right text-sm">
                            {t.totalReplied.toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <RateCell rate={t.deliveryRate} color="emerald" />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <RateCell rate={t.replyRate} color="teal" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!isLoading &&
              (!templateStats || templateStats.length === 0) &&
              totals.total === 0 && (
                <div className="flex flex-col items-center py-16 text-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No campaign data yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Send your first campaign to see performance metrics
                  </p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────

function OverviewCard({
  icon: Icon,
  label,
  value,
  sub,
  subColor,
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
  subColor?: string;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className={`text-xs mt-0.5 ${subColor || "text-muted-foreground"}`}>
        {sub}
      </p>
    </div>
  );
}

function RateCell({
  rate,
  color,
}: {
  rate: number;
  color: "emerald" | "teal";
}) {
  const barColor = color === "emerald" ? "bg-emerald-500" : "bg-teal-500";
  const textColor = color === "emerald" ? "text-emerald-700" : "text-teal-700";

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="w-16 h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${Math.min(rate * 100, 100)}%` }}
        />
      </div>
      <span
        className={`text-sm font-medium ${textColor} min-w-[45px] text-right`}
      >
        {pct(rate)}
      </span>
    </div>
  );
}
