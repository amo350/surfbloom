import { requireAuth } from "@/lib/auth-utils";
import { SettingsContent } from "./settings-context";

type Props = {
  params: Promise<{ workspaceId: string }>;
};

const SettingsPage = async ({ params }: Props) => {
  await requireAuth();
  const { workspaceId } = await params;

  return (
    <div className="p-6">
      <SettingsContent workspaceId={workspaceId} />
    </div>
  );
};

export default SettingsPage;
