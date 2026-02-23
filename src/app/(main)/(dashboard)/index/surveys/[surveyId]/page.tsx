import { redirect } from "next/navigation";

export default async function SurveyDetailPage({
  params,
}: {
  params: Promise<{ surveyId: string }>;
}) {
  const { surveyId } = await params;
  redirect(`/index/campaigns/surveys/${surveyId}`);
}
