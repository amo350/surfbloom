import { KeywordManager } from "@/features/campaigns/components/KeywordManager";

export default async function KeywordsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return (
    <KeywordManager
      workspaceId={workspaceId}
      basePath={`/workspaces/${workspaceId}`}
    />
  );
}
