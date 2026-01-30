import { Suspense } from "react";
import { requireAuth } from "@/lib/auth-utils";
import { IndexMembers } from "@/features/account-members/components/IndexMembers";

const MembersPage = async () => {
  const session = await requireAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Members</h1>
      <Suspense fallback={<div>Loading members...</div>}>
        <IndexMembers currentUserId={session.user.id} />
      </Suspense>
    </div>
  );
};

export default MembersPage;
