"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { EditWorkspaceForm } from "@/features/workspaces/components/EditWorkspaceForm";

interface SettingsContentProps {
  workspaceId: string;
}

export const SettingsContent = ({ workspaceId }: SettingsContentProps) => {
  const trpc = useTRPC();
  const {
    data: workspace,
    isLoading,
    isError,
    error,
  } = useQuery(trpc.workspaces.getOne.queryOptions({ id: workspaceId }));

  if (isLoading || !workspace) {
    if (isError && error) {
      if (typeof console !== "undefined") console.error("Workspace settings load failed:", error);
      return (
        <div className="text-destructive">
          Failed to load workspace. Please try again.
        </div>
      );
    }
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
