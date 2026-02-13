"use client";

import { TaskModal } from "@/features/tasks/components/TaskModal";
import { useGetTaskColumns } from "@/features/tasks/hooks/use-task-columns";
import { useCreateTask } from "@/features/tasks/hooks/use-tasks";
import { useTaskModal } from "@/features/tasks/hooks/use-task-modal";
import { authClient } from "@/lib/auth-client";
import { ReviewsContent } from "./reviews";

type ReviewsWithTaskModalProps = {
  workspaceId: string;
  workspace: { googlePlaceId?: string | null; scrapedPlaceData?: unknown };
};

export function ReviewsWithTaskModal({
  workspaceId,
  workspace,
}: ReviewsWithTaskModalProps) {
  const taskModal = useTaskModal();
  const createTask = useCreateTask();
  const { data: columns } = useGetTaskColumns(workspaceId);
  const { data: session } = authClient.useSession();

  const defaultColumn =
    columns?.find((col) => col.position === 3) ?? columns?.[0];

  const handleOpenTaskModal = () => {
    if (!defaultColumn) return;
    createTask.mutate(
      {
        workspaceId,
        columnId: defaultColumn.id,
        name: "Untitled task",
        ...(session?.user?.id && { assigneeId: session.user.id }),
      },
      {
        onSuccess: (data) => taskModal.open(data.id),
      },
    );
  };

  return (
    <>
      <ReviewsContent
        workspaceId={workspaceId}
        workspace={workspace}
        onOpenTaskModal={handleOpenTaskModal}
      />
      <TaskModal
        open={taskModal.isOpen}
        onOpenChange={(open) => {
          if (!open) taskModal.close();
        }}
        workspaceId={workspaceId}
      />
    </>
  );
}
