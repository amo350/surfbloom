import { SequenceBuilder } from "@/features/sequences/components/SequenceBuilder";
import { SequenceDetail } from "@/features/sequences/components/SequenceDetail";

export default async function SequenceBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ sequenceId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { sequenceId } = await params;
  const { tab } = await searchParams;

  if (tab === "detail") {
    return (
      <SequenceDetail sequenceId={sequenceId} workspaceId="" basePath="/index" />
    );
  }

  return (
    <SequenceBuilder sequenceId={sequenceId} workspaceId="" basePath="/index" />
  );
}
