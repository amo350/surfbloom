import { CampaignBuilder } from "@/features/campaigns/components/CampaignBuilder";

export default function WorkspaceNewCampaignPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  return <CampaignBuilder params={params} />;
}
