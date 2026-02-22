"use client";

import { Loader2, Mail, Eye, MousePointer, AlertTriangle, ShieldX } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

interface EmailStatsCardProps {
  campaignId: string;
}

export function EmailStatsCard({ campaignId }: EmailStatsCardProps) {
  const trpc = useTRPC();
  const { data: stats, isLoading } = useQuery(
    trpc.emailStats.getCampaignEmailStats.queryOptions({ campaignId }),
  );

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 flex justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats || stats.sent === 0) return null;

  const openRate = stats.openRate * 100;
  const clickRate = stats.clickRate * 100;
  const bounceRate = stats.bounceRate * 100;

  return (
    <div className="border rounded-lg bg-white">
      <div className="px-4 py-3 border-b bg-muted/5">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold">Email Performance</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 divide-x">
        <StatCell label="Delivered" value={stats.delivered} total={stats.sent} />
        <StatCell
          label="Opened"
          value={stats.uniqueOpens}
          total={stats.delivered}
          icon={<Eye className="h-3 w-3 text-blue-500" />}
          rate={openRate}
        />
        <StatCell
          label="Clicked"
          value={stats.totalClicks}
          total={stats.delivered}
          icon={<MousePointer className="h-3 w-3 text-teal-500" />}
          rate={clickRate}
        />
        <StatCell
          label="Bounced"
          value={stats.bounced}
          total={stats.sent}
          icon={<AlertTriangle className="h-3 w-3 text-amber-500" />}
          rate={bounceRate}
        />
        <StatCell
          label="Complaints"
          value={stats.complained}
          total={stats.sent}
          icon={<ShieldX className="h-3 w-3 text-red-500" />}
        />
      </div>

      {stats.delivered > 0 && (
        <div className="px-4 py-2 border-t">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-muted-foreground w-16">Funnel</span>
            <div className="flex-1 h-2 rounded-full bg-muted/20 overflow-hidden flex">
              <div
                className="h-full bg-slate-300"
                style={{ width: `${Math.min((stats.delivered / stats.sent) * 100, 100)}%` }}
                title={`${stats.delivered} delivered`}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] text-muted-foreground w-16">Opens</span>
            <div className="flex-1 h-2 rounded-full bg-muted/20 overflow-hidden">
              <div
                className="h-full bg-blue-400"
                style={{ width: `${Math.min(openRate, 100)}%` }}
                title={`${stats.uniqueOpens} unique opens`}
              />
            </div>
            <span className="text-[9px] font-medium w-10 text-right">
              {openRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] text-muted-foreground w-16">Clicks</span>
            <div className="flex-1 h-2 rounded-full bg-muted/20 overflow-hidden">
              <div
                className="h-full bg-teal-400"
                style={{ width: `${Math.min(clickRate, 100)}%` }}
                title={`${stats.totalClicks} clicks`}
              />
            </div>
            <span className="text-[9px] font-medium w-10 text-right">
              {clickRate.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCell({
  label,
  value,
  total,
  icon,
  rate,
}: {
  label: string;
  value: number;
  total: number;
  icon?: React.ReactNode;
  rate?: number;
}) {
  return (
    <div className="px-3 py-3 text-center">
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span className="text-lg font-semibold">{value}</span>
      </div>
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">
        {label}
      </p>
      {rate !== undefined && total > 0 && (
        <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
          {rate.toFixed(1)}%
        </p>
      )}
    </div>
  );
}
