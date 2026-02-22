"use client";

import { useMemo, useState } from "react";
import { CampaignHeader } from "@/features/campaigns/components/CampaignHeader";
import { CampaignsList } from "@/features/campaigns/components/CampaignsList";
import { CampaignSubNav } from "@/features/campaigns/components/CampaignSubNav";

export function CampaignsContent({ workspaceId }: { workspaceId?: string }) {
  const [search, setSearch] = useState("");
  const basePath = useMemo(
    () => (workspaceId ? `/workspaces/${workspaceId}` : "/index"),
    [workspaceId],
  );

  return (
    <div className="h-full flex flex-col">
      <CampaignHeader
        basePath={basePath}
        search={search}
        onSearchChange={setSearch}
      />
      <CampaignSubNav basePath={basePath} />
      <div className="flex-1 overflow-y-auto p-6">
        <CampaignsList workspaceId={workspaceId} search={search} />
      </div>
    </div>
  );
}
