import { use } from "react";
import { CampaignDetail } from "@/features/campaigns/components/CampaignDetail";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = use(params);
  return <CampaignDetail campaignId={campaignId} />;
}
