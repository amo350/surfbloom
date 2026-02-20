"use client";

import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import { CampaignsList } from "@/features/campaigns/components/CampaignsList";

export function CampaignsContent({ workspaceId }: { workspaceId?: string }) {
  return (
    <div className="h-full flex flex-col">
      <AppHeader>
        <AppHeaderTitle title="Campaigns" />
      </AppHeader>
      <div className="flex-1 overflow-y-auto p-6">
        <CampaignsList workspaceId={workspaceId} />
      </div>
    </div>
  );
}
