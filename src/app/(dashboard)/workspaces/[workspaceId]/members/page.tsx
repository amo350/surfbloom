import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MembersContent } from "@/features/members/components/members-content";

type Props = {
  params: Promise<{ workspaceId: string }>;
};

const MembersPage = async ({ params }: Props) => {
  const session = await requireAuth();
  const { workspaceId } = await params;

  const membership = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId,
      },
    },
  });

  if (!membership) {
    redirect("/index/locations");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Members</h1>
      <MembersContent workspaceId={workspaceId} />
    </div>
  );
};

export default MembersPage;
