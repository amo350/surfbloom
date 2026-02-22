import { SequenceList } from "@/features/sequences/components/SequenceList";

export default async function SequencesPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return (
    <SequenceList
      workspaceId={workspaceId}
      basePath={`/workspaces/${workspaceId}`}
    />
  );
}
