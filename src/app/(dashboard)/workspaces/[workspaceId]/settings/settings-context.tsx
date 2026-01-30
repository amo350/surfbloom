"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { EditWorkspaceForm } from "@/features/workspaces/components/EditWorkspaceForm";
import {
  InviteMembersCard,
  DangerZoneCard,
} from "@/features/workspaces/components/WorkspaceSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-6">
      {/* Row 1: Location Info (75%) + Invite Members (25%) */}
      <div className="grid grid-cols-4 gap-6 items-stretch">
        <div className="col-span-3 flex">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent>
              <EditWorkspaceForm
                workspaceId={workspaceId}
                initialValues={{
                  name: workspace.name,
                  imageUrl: workspace.imageUrl ?? null,
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 flex">
          <InviteMembersCard
            workspaceId={workspaceId}
            inviteCode={workspace.inviteCode}
          />
        </div>
      </div>

      {/* Row 2: Danger Zone (full width) */}
      <DangerZoneCard
        workspaceId={workspaceId}
        workspaceName={workspace.name}
      />
    </div>
  );
};
