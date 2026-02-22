import { SequenceBuilder } from "@/features/sequences/components/SequenceBuilder";
import { SequenceDetail } from "@/features/sequences/components/SequenceDetail";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function SequenceBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ sequenceId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { sequenceId } = await params;
  const { tab } = await searchParams;
  const sequence = await prisma.campaignSequence.findUnique({
    where: { id: sequenceId },
    select: { workspaceId: true },
  });
  if (!sequence) {
    notFound();
  }
  const workspaceId = sequence.workspaceId;

  if (tab === "detail") {
    return (
      <SequenceDetail
        sequenceId={sequenceId}
        workspaceId={workspaceId}
        basePath="/index"
      />
    );
  }

  return (
    <SequenceBuilder
      sequenceId={sequenceId}
      workspaceId={workspaceId}
      basePath="/index"
    />
  );
}
