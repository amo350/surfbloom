import { requireAuth } from "@/lib/auth-utils";

type PageProps = {
  params: Promise<{
    credentialId: string;
  }>;
};

const CredentialId = async ({ params }: PageProps) => {
  await requireAuth();
  const { credentialId } = await params;
  return <div>CredentialId: {credentialId}</div>;
};

export default CredentialId;
