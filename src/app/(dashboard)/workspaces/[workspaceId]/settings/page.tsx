import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { SettingsContent } from "./settings-context";

type Props = {
  params: Promise<{ workspaceId: string }>;
};

const SettingsPage = async ({ params }: Props) => {
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
      <SettingsContent workspaceId={workspaceId} />
    </div>
  );
};

export default SettingsPage;
