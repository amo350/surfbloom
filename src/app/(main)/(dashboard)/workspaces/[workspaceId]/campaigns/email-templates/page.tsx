import { EmailTemplateManager } from "@/features/email/components/EmailTemplateManager";

export default async function EmailTemplatesPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <EmailTemplateManager basePath={`/workspaces/${workspaceId}`} />;
}
