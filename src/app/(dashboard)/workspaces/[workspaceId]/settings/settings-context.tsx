"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { EditWorkspaceForm } from "@/features/workspaces/components/EditWorkspaceForm";

interface SettingsContentProps {
  workspaceId: string;
}

export const SettingsContent = ({ workspaceId }: SettingsContentProps) => {
  const trpc = useTRPC();
  const { data: workspace, isLoading } = useQuery(
    trpc.workspaces.getOne.queryOptions({ id: workspaceId }),
  );

  if (isLoading || !workspace) {
    return <div>Loading...</div>;
  }

  return (
    <EditWorkspaceForm
      workspaceId={workspaceId}
      initialValues={{
        name: workspace.name,
        imageUrl: workspace.imageUrl ?? null,
      }}
    />
  );
};
