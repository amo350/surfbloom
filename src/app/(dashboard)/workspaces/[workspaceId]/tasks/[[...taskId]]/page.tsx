import { redirect } from "next/navigation";
import { TasksPageClient } from "@/features/tasks/components/TasksPageClient";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    workspaceId: string;
    taskId?: string[]; // Optional catch-all returns array or undefined
  }>;
};

const TasksPage = async ({ params }: Props) => {
  const session = await requireAuth();
  const { workspaceId, taskId } = await params;

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

  // taskId is an array like ["abc123"] or undefined
  const initialTaskId = taskId?.[0];

  return (
    <TasksPageClient workspaceId={workspaceId} initialTaskId={initialTaskId} />
  );
};

export default TasksPage;
