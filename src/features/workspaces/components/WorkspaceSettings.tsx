"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CopyIcon, CheckIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useConfirm } from "@/hooks/use-confirm";
import {
  useRemoveWorkspace,
  useResetInviteCode,
} from "../hooks/use-workspaces";
import { toast } from "sonner";

interface WorkspaceSettingsProps {
  workspaceId: string;
  inviteCode: string;
}

export const InviteMembersCard = ({
  workspaceId,
  inviteCode,
}: WorkspaceSettingsProps) => {
  const [copied, setCopied] = useState(false);
  const [fullInviteLink, setFullInviteLink] = useState(`/join/${inviteCode}`);
  const resetInviteCode = useResetInviteCode();

  useEffect(() => {
    setFullInviteLink(`${window.location.origin}/join/${inviteCode}`);
  }, [inviteCode]);

  const [ResetDialog, confirmReset] = useConfirm(
    "Reset Invite Link",
    "This will invalidate the current invite link. Any pending invites will no longer work.",
    "destructive",
  );

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(fullInviteLink);
    setCopied(true);
    toast.success("Invite link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetInviteCode = async () => {
    const confirmed = await confirmReset();
    if (!confirmed) return;

    resetInviteCode.mutate({ id: workspaceId });
  };

  return (
    <>
      <ResetDialog />
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Invite Members</CardTitle>
          <CardDescription>
            Use the invite link to add members to your location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input value={fullInviteLink} readOnly className="flex-1" />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyInviteLink}
            >
              {copied ? (
                <CheckIcon className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground min-w-0 flex-1 shrink">
              Reset the invite link if it has been compromised
            </p>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={handleResetInviteCode}
              disabled={resetInviteCode.isPending}
            >
              {resetInviteCode.isPending ? "Resetting..." : "Reset Link"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

interface DangerZoneCardProps {
  workspaceId: string;
  workspaceName: string;
}

export const DangerZoneCard = ({
  workspaceId,
  workspaceName,
}: DangerZoneCardProps) => {
  const router = useRouter();
  const removeWorkspace = useRemoveWorkspace();

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Location",
    `Are you sure you want to delete "${workspaceName}"? This action cannot be undone. All workflows, executions, and data will be permanently deleted.`,
    "destructive",
  );

  const handleDelete = async () => {
    const confirmed = await confirmDelete();
    if (!confirmed) return;

    removeWorkspace.mutate(
      { id: workspaceId },
      {
        onSuccess: () => {
          router.push("/index/locations");
        },
      },
    );
  };

  return (
    <>
      <DeleteDialog />
      <Card>
        <CardHeader>
          <CardTitle>Remove</CardTitle>
          <CardDescription>
            Irreversible actions for this location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete this location</p>
              <p className="text-sm text-muted-foreground">
                Once deleted, all data will be permanently removed
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={removeWorkspace.isPending}
            >
              {removeWorkspace.isPending ? "Deleting..." : "Delete Location"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
