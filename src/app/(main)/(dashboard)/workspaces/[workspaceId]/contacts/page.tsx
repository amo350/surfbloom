import { ContactsContent } from "../../../index/contacts/contacts-content";

export default async function WorkspaceContactsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <ContactsContent workspaceId={workspaceId} />;
}
