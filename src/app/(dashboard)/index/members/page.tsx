import { requireAuth } from "@/lib/auth-utils";
import { IndexMembers } from "@/features/account-members/components/IndexMembers";

const MembersPage = async () => {
  await requireAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Members</h1>
      <IndexMembers />
    </div>
  );
};

export default MembersPage;
