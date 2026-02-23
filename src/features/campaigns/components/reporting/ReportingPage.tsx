"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useReportingLocationComparison } from "@/features/campaigns/hooks/use-reporting";
import { ChannelDonut } from "./ChannelDonut";
import { DeliveryFunnel } from "./DeliveryFunnel";
import { ExportButton } from "./ExportButton";
import { HeroMetrics } from "./HeroMetrics";
import { SendsChart } from "./SendsChart";
import { SequenceSummary } from "./SequenceSummary";
import { TopCampaignsTable } from "./TopCampaignsTable";

const DAY_OPTIONS = [7, 30, 60, 90];
const CHANNEL_OPTIONS: Array<"all" | "sms" | "email"> = ["all", "sms", "email"];

export function ReportingPage({
  workspaceId,
  basePath,
}: {
  workspaceId?: string;
  basePath: string;
}) {
  const [days, setDays] = useState(30);
  const [channel, setChannel] = useState<"all" | "sms" | "email">("all");
  const { data: locationStats } = useReportingLocationComparison();

  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`${basePath}/campaigns`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <AppHeaderTitle title="Reporting" />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  days === d
                    ? "bg-slate-900 text-white"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {CHANNEL_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  channel === c
                    ? "bg-slate-900 text-white"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {c === "all" ? "All" : c.toUpperCase()}
              </button>
            ))}
          </div>

          <ExportButton
            workspaceId={workspaceId}
            days={days}
            channel={channel}
          />
        </div>
      </AppHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <HeroMetrics workspaceId={workspaceId} days={days} channel={channel} />
        <SendsChart workspaceId={workspaceId} days={days} channel={channel} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChannelDonut workspaceId={workspaceId} days={days} />
          <DeliveryFunnel
            workspaceId={workspaceId}
            days={days}
            channel={channel}
          />
        </div>

        <TopCampaignsTable
          workspaceId={workspaceId}
          days={days}
          channel={channel}
        />
        <SequenceSummary workspaceId={workspaceId} />

        {!workspaceId && locationStats?.locations?.length ? (
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm font-semibold mb-3">Location Comparison</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {locationStats.locations.map((loc: any) => (
                <div key={loc.workspaceId} className="rounded border p-3">
                  <p className="text-sm font-medium truncate">
                    {loc.workspaceName}
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Sent</p>
                      <p className="font-medium tabular-nums">
                        {loc.sent.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Delivered</p>
                      <p className="font-medium tabular-nums">
                        {loc.delivered.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Replied</p>
                      <p className="font-medium tabular-nums">
                        {loc.replied.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
