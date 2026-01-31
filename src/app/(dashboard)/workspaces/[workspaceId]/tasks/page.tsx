import { Suspense } from "react";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TaskHeader } from "@/features/tasks/components/TaskHeader";
import { TasksContent } from "@/features/tasks/components/TasksContent";

type Props = {
  params: Promise<{
    workspaceId: string;
  }>;
};

const TasksPage = async ({ params }: Props) => {
  const session = await requireAuth();
  const { workspaceId } = await params;

  // Verify membership
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
    <>
      <TaskHeader workspaceId={workspaceId} />
      <div className="flex-1 p-6">
        <Suspense fallback={<div>Loading tasks...</div>}>
          <TasksContent workspaceId={workspaceId} />
        </Suspense>
      </div>
    </>
  );
};

export default TasksPage;