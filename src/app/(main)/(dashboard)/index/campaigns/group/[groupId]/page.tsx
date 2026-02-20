import { use } from "react";
import { CampaignGroupOverview } from "@/features/campaigns/components/CampaignGroupOverview";

export default function CampaignGroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  return <CampaignGroupOverview groupId={groupId} />;
}
