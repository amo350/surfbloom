"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { PlusIcon, TrashIcon, MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { InviteMemberForm } from "@/features/invitations/components/InviteMemberForm";
import {
  useInvitations,
  useRemoveInvitation,
} from "@/features/invitations/hooks/use-invitations";
import {
  useSuspenseMembers,
  useRemoveMember,
} from "@/features/members/hooks/use-members";
import { MemberRole } from "@/generated/prisma/enums";

interface MembersContentProps {
  workspaceId: string;
}

export const MembersContent = ({ workspaceId }: MembersContentProps) => {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const trpc = useTRPC();
  const { data: members, isLoading: membersLoading } = useQuery(
    trpc.members.getByWorkspace.queryOptions({ workspaceId }),
  );
  const { data: invitations, isLoading: invitationsLoading } =
    useInvitations(workspaceId);
  const removeInvitation = useRemoveInvitation();
  const removeMember = useRemoveMember();

  if (membersLoading) {
    return <div>Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with invite button */}
      <div className="flex justify-end">
        <Button onClick={() => setInviteDialogOpen(true)}>
          <PlusIcon className="size-4 mr-2" />
          New Member
        </Button>
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
          </DialogHeader>
          <InviteMemberForm
            workspaceId={workspaceId}
            onSuccess={() => setInviteDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Current members */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({members?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members?.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.user.image ?? undefined} />
                    <AvatarFallback>
                      {member.user.name?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      member.role === MemberRole.ADMIN ? "default" : "secondary"
                    }
                  >
                    {member.role}
                  </Badge>
                  {/* // TODO: Add remove member button with confirmation */}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending invitations */}
      <Card>
        <CardHeader>
          <CardTitle>
            Pending Invitations ({invitations?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invitationsLoading ? (
            <div>Loading...</div>
          ) : invitations?.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No pending invitations
            </p>
          ) : (
            <div className="space-y-4">
              {invitations?.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                      <MailIcon className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited by {invitation.invitedBy.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{invitation.role}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        removeInvitation.mutate({
                          id: invitation.id,
                          workspaceId,
                        })
                      }
                      disabled={removeInvitation.isPending}
                    >
                      <TrashIcon className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
