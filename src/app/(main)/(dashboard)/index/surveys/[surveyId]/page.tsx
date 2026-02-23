import { SurveyBuilder } from "@/features/surveys/components/SurveyBuilder";

export default async function SurveyDetailPage({
  params,
}: {
  params: Promise<{ surveyId: string }>;
}) {
  const { surveyId } = await params;
  return <SurveyBuilder surveyId={surveyId} />;
}
