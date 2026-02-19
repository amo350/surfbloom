import { ContactDetailContent } from "../../../../index/contacts/[contactId]/contact-detail-content";

export default function WorkspaceContactDetailPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  return <ContactDetailContent params={params} />;
}
