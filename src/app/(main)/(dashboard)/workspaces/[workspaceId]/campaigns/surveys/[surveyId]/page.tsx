import { SurveyBuilder } from "@/features/surveys/components/SurveyBuilder";

export default async function WorkspaceCampaignSurveyDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string; surveyId: string }>;
}) {
  const { workspaceId, surveyId } = await params;
  return (
    <SurveyBuilder
      surveyId={surveyId}
      listPath={`/workspaces/${workspaceId}/campaigns/surveys`}
    />
  );
}
