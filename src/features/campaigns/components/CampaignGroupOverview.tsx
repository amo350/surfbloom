"use client";

import Link from "next/link";
import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import { CampaignStatusBadge } from "@/features/campaigns/components/CampaignStatusBadge";
import { useCampaignGroup } from "@/features/campaigns/hooks/use-campaigns";

export function CampaignGroupOverview({ groupId }: { groupId: string }) {
  const { data, isLoading } = useCampaignGroup(groupId);

  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <AppHeaderTitle title={data?.name || "Campaign Group"} />
      </AppHeader>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading && (
          <div className="text-sm text-muted-foreground">Loading group...</div>
        )}
        {data && (
          <>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Status
                </p>
                <div className="mt-1">
                  <CampaignStatusBadge status={data.status} />
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Recipients
                </p>
                <p className="text-sm font-medium mt-1">
                  {data.totals.recipients}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Sent
                </p>
                <p className="text-sm font-medium mt-1">{data.totals.sent}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Delivered
                </p>
                <p className="text-sm font-medium mt-1">
                  {data.totals.delivered}
                </p>
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/30">
                Per-location campaigns
              </div>
              <div className="divide-y">
                {data.campaigns.map((campaign: any) => (
                  <Link
                    key={campaign.id}
                    href={`/index/campaigns/${campaign.id}`}
                    className="px-3 py-2.5 flex items-center justify-between text-sm hover:bg-muted/20"
                  >
                    <span>{campaign.workspace?.name || "Location"}</span>
                    <CampaignStatusBadge status={campaign.status} />
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
