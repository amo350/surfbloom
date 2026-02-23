import { SurveyList } from "@/features/surveys/components/SurveyList";

export default async function WorkspaceCampaignSurveysPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return (
    <SurveyList basePath={`/workspaces/${workspaceId}/campaigns/surveys`} />
  );
}
