import { ContactDetailContent } from "./contact-detail-content";

export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  return <ContactDetailContent params={params} />;
}
