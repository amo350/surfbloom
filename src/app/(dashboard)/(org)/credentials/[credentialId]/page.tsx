import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import { requireAuth } from "@/lib/auth-utils";

type PageProps = {
  params: Promise<{
    credentialId: string;
  }>;
};

const CredentialId = async ({ params }: PageProps) => {
  await requireAuth();
  const { credentialId } = await params;
  return (
    <>
      <AppHeader>
        <AppHeaderTitle title="Credential Details" />
      </AppHeader>
      <div className="p-6">CredentialId: {credentialId}</div>
    </>
  );
};

export default CredentialId;
