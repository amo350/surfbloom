import { SegmentManager } from "@/features/campaigns/components/SegmentManager";

export default async function SegmentsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <SegmentManager workspaceId={workspaceId} />;
}
