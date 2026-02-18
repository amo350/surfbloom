"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditWorkspaceForm } from "@/features/workspaces/components/EditWorkspaceForm";
import { SmsSetupProgress } from "@/features/integrations/components/SmsSetupProgress";
import {
  useTwilioConfig,
  useWorkspaceSmsNumber,
} from "@/features/integrations/hooks/use-integrations";
import {
  DangerZoneCard,
  InviteMembersCard,
} from "@/features/workspaces/components/WorkspaceSettings";
import { useTRPC } from "@/trpc/client";

interface SettingsContentProps {
  workspaceId: string;
}

export const SettingsContent = ({ workspaceId }: SettingsContentProps) => {
  const trpc = useTRPC();
  const { data: workspace, isLoading } = useQuery(
    trpc.workspaces.getOne.queryOptions({ id: workspaceId }),
  );
  const twilioConfig = useTwilioConfig();
  const smsNumber = useWorkspaceSmsNumber(workspaceId);

  if (isLoading || !workspace) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Location Info (75%) + Invite Members (25%) */}
      <div className="grid grid-cols-4 gap-6 items-stretch">
        <div className="col-span-3 space-y-6">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent>
              <EditWorkspaceForm
                workspaceId={workspaceId}
                initialValues={{
                  name: workspace.name,
                  imageUrl: workspace.imageUrl ?? null,
                  address: workspace.address ?? null,
                  city: workspace.city ?? null,
                  state: workspace.state ?? null,
                  zipCode: workspace.zipCode ?? null,
                  phone: workspace.phone ?? null,
                  description: workspace.description ?? null,
                  paymentLink: workspace.paymentLink ?? null,
                  feedbackSlug: workspace.feedbackSlug ?? null,
                  googleReviewUrl: workspace.googleReviewUrl ?? null,
                  feedbackHeading: workspace.feedbackHeading ?? null,
                  feedbackMessage: workspace.feedbackMessage ?? null,
                }}
                smsNumber={smsNumber.data?.phoneNumber}
              />
            </CardContent>
          </Card>

          <SmsSetupProgress
            hasSubaccount={!!twilioConfig.data}
            hasPhoneNumber={!!smsNumber.data?.phoneNumber}
            verificationStatus={
              twilioConfig.data?.verificationStatus || "not_started"
            }
            phoneNumber={smsNumber.data?.phoneNumber}
          />
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
