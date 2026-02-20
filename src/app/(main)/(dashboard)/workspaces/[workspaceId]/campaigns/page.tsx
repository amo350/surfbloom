import { use } from "react";
import { CampaignsContent } from "../../../index/campaigns/campaigns-content";

export default function WorkspaceCampaignsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  return <CampaignsContent workspaceId={workspaceId} />;
}
