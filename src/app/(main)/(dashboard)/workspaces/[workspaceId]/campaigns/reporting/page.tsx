import { ReportingPage } from "@/features/campaigns/components/reporting/ReportingPage";

export default async function WorkspaceCampaignReportingPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return (
    <ReportingPage
      workspaceId={workspaceId}
      basePath={`/workspaces/${workspaceId}`}
    />
  );
}
