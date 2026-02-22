"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle,
  Link2,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Workflow,
} from "lucide-react";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import { useCrossLocationStats } from "../hooks/use-campaigns";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function CampaignReporting() {
  const trpc = useTRPC();
  const { data, isLoading } = useCrossLocationStats();
  const { data: emailCampaigns } = useQuery(
    trpc.campaigns.getCampaigns.queryOptions({
      workspaceId: undefined,
      channel: "email",
      page: 1,
      pageSize: 200,
    }),
  );
  const { data: sequences } = useQuery(
    trpc.sequences.getSequences.queryOptions({ workspaceId: undefined }),
  );

  const locations = data?.locations || [];
  const totals = data?.totals;
  const emailItems = emailCampaigns?.items || [];
  const hasEmailData = emailItems.length > 0;
  const hasSequenceData = (sequences?.length || 0) > 0;

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

        {!isLoading && totals && totals.sent > 0 && (
          <>
            {/* Global overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <OverviewCard
                icon={MapPin}
                label="Locations"
                value={totals.locations.toString()}
              />
              <OverviewCard
                icon={Send}
                label="Total Sent"
                value={totals.sent.toLocaleString()}
                sub={`${totals.campaigns} campaigns`}
              />
              <OverviewCard
                icon={CheckCircle}
                label="Delivered"
                value={totals.delivered.toLocaleString()}
                sub={totals.sent > 0 ? pct(totals.delivered / totals.sent) : "—"}
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
                icon={Sparkles}
                label="AI Replies"
                value={totals.aiReplies.toLocaleString()}
                sub="Auto-responded"
                subColor="text-violet-600"
              />
              {totals.linkClicks > 0 && (
                <OverviewCard
                  icon={Link2}
                  label="Link Clicks"
                  value={totals.linkClicks.toLocaleString()}
                  sub={totals.sent > 0 ? pct(totals.linkClicks / totals.sent) : "—"}
                  subColor="text-blue-600"
                />
              )}
            </div>

            {/* Location cards */}
            {locations.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Performance by Location
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {locations.map((loc: any, i: number) => (
                    <LocationCard
                      key={loc.workspaceId}
                      location={loc}
                      rank={i + 1}
                      isTop={i === 0 && locations.length > 1}
                      isBottom={i === locations.length - 1 && locations.length > 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {hasEmailData && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              Email Campaigns
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <OverviewCard
                icon={Mail}
                label="Email Campaigns"
                value={emailItems.length.toString()}
              />
              <OverviewCard
                icon={Send}
                label="Total Sent"
                value={emailItems
                  .reduce((sum: number, c: any) => sum + (c.sentCount || 0), 0)
                  .toLocaleString()}
              />
              <OverviewCard
                icon={CheckCircle}
                label="Total Delivered"
                value={emailItems
                  .reduce((sum: number, c: any) => sum + (c.deliveredCount || 0), 0)
                  .toLocaleString()}
              />
              <OverviewCard
                icon={MessageSquare}
                label="Total Failed"
                value={emailItems
                  .reduce((sum: number, c: any) => sum + (c.failedCount || 0), 0)
                  .toLocaleString()}
              />
            </div>
          </div>
        )}

        {hasSequenceData && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Workflow className="h-4 w-4 text-purple-500" />
              Drip Sequences
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <OverviewCard
                icon={Workflow}
                label="Total Sequences"
                value={(sequences?.length || 0).toString()}
              />
              <OverviewCard
                icon={CheckCircle}
                label="Active"
                value={(sequences?.filter((s: any) => s.status === "active").length || 0).toString()}
              />
              <OverviewCard
                icon={Users}
                label="Total Enrollments"
                value={(sequences || [])
                  .reduce((sum: number, s: any) => sum + (s._count?.enrollments || 0), 0)
                  .toLocaleString()}
              />
              <OverviewCard
                icon={BarChart3}
                label="Total Steps"
                value={(sequences || [])
                  .reduce((sum: number, s: any) => sum + (s._count?.steps || 0), 0)
                  .toLocaleString()}
              />
            </div>
          </div>
        )}

        {/* Empty */}
        {!isLoading && (!totals || totals.sent === 0) && !hasEmailData && !hasSequenceData && (
          <div className="flex flex-col items-center py-16 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No campaign data yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Send your first campaign to see performance across locations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────

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
  sub?: string;
  subColor?: string;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      {sub && (
        <p className={`text-xs mt-0.5 ${subColor || "text-muted-foreground"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

function LocationCard({
  location,
  rank,
  isTop,
  isBottom,
}: {
  location: any;
  rank: number;
  isTop: boolean;
  isBottom: boolean;
}) {
  // Trend: compare this week vs last week reply rate
  const thisWeek = location.weeklyTrend.find((w: any) => w.week === 0);
  const lastWeek = location.weeklyTrend.find((w: any) => w.week === 1);
  const thisWeekRate = thisWeek?.sent > 0 ? thisWeek.replied / thisWeek.sent : 0;
  const lastWeekRate = lastWeek?.sent > 0 ? lastWeek.replied / lastWeek.sent : 0;
  const trendUp = thisWeekRate >= lastWeekRate;

  return (
    <div
      className={`border rounded-lg p-4 transition-colors ${
        isTop
          ? "border-teal-200 bg-teal-50/20"
          : isBottom
            ? "border-amber-200 bg-amber-50/20"
            : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            {isTop && <Trophy className="h-3.5 w-3.5 text-amber-500" />}
            <p className="text-sm font-semibold">{location.name}</p>
          </div>
          {location.phone && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {location.phone}
            </p>
          )}
        </div>
        <span className="text-[10px] font-medium text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
          #{rank}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <MiniStat label="Sent" value={location.sent.toLocaleString()} />
        <MiniStat
          label="Delivered"
          value={pct(location.deliveryRate)}
          color="text-emerald-600"
        />
        <MiniStat
          label="Reply Rate"
          value={pct(location.replyRate)}
          color="text-teal-600"
        />
        <MiniStat
          label="Failed"
          value={location.failed.toLocaleString()}
          color={location.failed > 0 ? "text-red-500" : undefined}
        />
        {location.linkClicks > 0 && (
          <MiniStat
            label="Clicks"
            value={location.linkClicks.toLocaleString()}
            color="text-blue-600"
          />
        )}
      </div>

      {/* Sparkline — 4 week trend */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <p className="text-[10px] text-muted-foreground">4-week trend</p>
          {thisWeek?.sent > 0 && (
            <div
              className={`flex items-center gap-0.5 ${
                trendUp ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {trendUp ? (
                <ArrowUpRight className="h-2.5 w-2.5" />
              ) : (
                <ArrowDownRight className="h-2.5 w-2.5" />
              )}
              <span className="text-[10px] font-medium">
                {pct(Math.abs(thisWeekRate - lastWeekRate))}
              </span>
            </div>
          )}
        </div>
        <SparkBars data={location.weeklyTrend} />
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground">
            {location.campaignCount} campaign
            {location.campaignCount !== 1 ? "s" : ""}
          </span>
          {location.aiReplies > 0 && (
            <span className="text-[10px] text-violet-600">
              {location.aiReplies} AI repl
              {location.aiReplies !== 1 ? "ies" : "y"}
            </span>
          )}
          {location.keywordSignups > 0 && (
            <span className="text-[10px] text-teal-600">
              {location.keywordSignups} text-to-join signup
              {location.keywordSignups !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {location.topTemplate && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
            Top: {location.topTemplate.name}
          </span>
        )}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${color || ""}`}>{value}</p>
    </div>
  );
}

function SparkBars({ data }: { data: any[] }) {
  // Reverse so oldest is left, newest is right
  const reversed = [...data].reverse();
  const maxSent = Math.max(...reversed.map((d) => d.sent), 1);
  const labels = ["4w ago", "3w ago", "2w ago", "This wk"];

  return (
    <div className="flex items-end gap-1 h-8">
      {reversed.map((d: any, i: number) => {
        const height = d.sent > 0 ? Math.max((d.sent / maxSent) * 100, 8) : 4;
        const replyPct = d.sent > 0 ? (d.replied / d.sent) * 100 : 0;

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full flex items-end justify-center h-8">
              <div
                className="w-full max-w-[24px] rounded-t-sm relative overflow-hidden bg-slate-200"
                style={{ height: `${height}%` }}
              >
                {/* Reply portion */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-teal-400"
                  style={{ height: `${replyPct}%` }}
                />
              </div>
            </div>
            <span className="text-[8px] text-muted-foreground/60">
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
