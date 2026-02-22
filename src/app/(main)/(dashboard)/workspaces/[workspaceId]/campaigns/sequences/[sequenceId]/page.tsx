import { SequenceBuilder } from "@/features/sequences/components/SequenceBuilder";
import { SequenceDetail } from "@/features/sequences/components/SequenceDetail";

export default async function SequenceBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string; sequenceId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { workspaceId, sequenceId } = await params;
  const { tab } = await searchParams;

  if (tab === "detail") {
    return (
      <SequenceDetail
        sequenceId={sequenceId}
        workspaceId={workspaceId}
        basePath={`/workspaces/${workspaceId}`}
      />
    );
  }

  return (
    <SequenceBuilder
      sequenceId={sequenceId}
      workspaceId={workspaceId}
      basePath={`/workspaces/${workspaceId}`}
    />
  );
}
