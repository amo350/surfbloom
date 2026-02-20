import { use } from "react";
import { CampaignDetail } from "@/features/campaigns/components/CampaignDetail";

export default function WorkspaceCampaignDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string; campaignId: string }>;
}) {
  const { workspaceId, campaignId } = use(params);
  return <CampaignDetail campaignId={campaignId} workspaceId={workspaceId} />;
}
