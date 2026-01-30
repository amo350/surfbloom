import { requireAuth } from "@/lib/auth-utils";
import { MembersContent } from "@/features/members/components/members-content";

type Props = {
  params: Promise<{ workspaceId: string }>;
};

const MembersPage = async ({ params }: Props) => {
  await requireAuth();
  const { workspaceId } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Members</h1>
      <MembersContent workspaceId={workspaceId} />
    </div>
  );
};

export default MembersPage;
