import { WebhookManager } from "@/features/webhooks/components/WebhookManager";

export default async function WebhooksPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WebhookManager workspaceId={workspaceId} />;
}
