"use client";

import { useState, useEffect } from "react";
import {
  ChevronDownIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  MapPinIcon,
  UserCogIcon,
  PencilIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/hooks/use-confirm";
import {
  useAccountMembers,
  useMemberWorkspaces,
  useUpdateAccountRole,
  useBulkUpdateAccountRole,
  useBulkInviteToWorkspace,
  useBulkDeleteUsers,
  useSetMainWorkspace,
} from "../hooks/use-account-members";
import { AccountRole } from "@/generated/prisma/enums";

// TODO: Define role capabilities
// OWNER: Full control - can assign owners, delete users, manage all settings
// MANAGER: Can invite users, change USER roles, manage workspaces
// USER: Basic access - can only view and access assigned workspaces

export const IndexMembers = ({ currentUserId }: { currentUserId: string }) => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [bulkRoleDialogOpen, setBulkRoleDialogOpen] = useState(false);
  const [bulkInviteDialogOpen, setBulkInviteDialogOpen] = useState(false);
  
  // Edit main location state
  const [editMainLocationDialogOpen, setEditMainLocationDialogOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);

  const { data: membersData, isLoading: membersLoading, refetch } = useAccountMembers(search);
  const members = membersData ?? [];

  // Current user role from full list so it persists when search filters out current user
  const [currentUserRole, setCurrentUserRole] = useState<AccountRole | null>(null);
  useEffect(() => {
    if (members && currentUserId) {
      const currentUser = members.find((m) => m.id === currentUserId);
      if (currentUser) {
        setCurrentUserRole(currentUser.accountRole);
      }
    }
  }, [members, currentUserId]);

  const isOwner = currentUserRole === AccountRole.OWNER;
  const isManager = currentUserRole === AccountRole.MANAGER;
  const isUser = currentUserRole === AccountRole.USER;

  const { data: memberWorkspaces, isLoading: workspacesLoading } = useMemberWorkspaces(editingMemberId);
  const updateRole = useUpdateAccountRole();
  const bulkUpdateRole = useBulkUpdateAccountRole();
  const bulkInvite = useBulkInviteToWorkspace();
  const bulkDelete = useBulkDeleteUsers();
  const setMainWorkspace = useSetMainWorkspace();

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Users",
    "Are you sure you want to delete the selected users? This action cannot be undone.",
    "destructive",
  );
  
  const [TransferOwnerDialog, confirmTransferOwner] = useConfirm(
    "Transfer Ownership",
    "Are you sure you want to transfer account ownership? You will be demoted to Manager and will no longer be able to transfer ownership.",
    "destructive",
  );

  const hasSelection = selectedIds.size > 0;
  const allSelected = members.length > 0 && selectedIds.size === members.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(members.map((m) => m.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleRoleChange = async (userId: string, role: AccountRole) => {
    if (role === AccountRole.OWNER) {
      const confirmed = await confirmTransferOwner();
      if (!confirmed) return;
    }

    updateRole.mutate(
      { userId, role },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };
  
  const handleEditMainLocation = (memberId: string, currentWorkspaceId?: string) => {
    setEditingMemberId(memberId);
    setSelectedWorkspaceId(currentWorkspaceId ?? null);
    setEditMainLocationDialogOpen(true);
  };
  
  const handleSaveMainLocation = () => {
    if (!editingMemberId) return;
    
    setMainWorkspace.mutate(
      { userId: editingMemberId, workspaceId: selectedWorkspaceId },
      {
        onSuccess: () => {
          setEditMainLocationDialogOpen(false);
          setEditingMemberId(null);
        },
      },
    );
  };
  
  const handleEditProfile = (memberId: string) => {
    // TODO: Open edit profile dialog
    console.log("Edit profile for:", memberId);
  };

  const handleRemoveUser = async (memberId: string) => {
    const confirmed = await confirmDelete();
    if (!confirmed) return;
    
    bulkDelete.mutate({ userIds: [memberId] });
  };

  const handleBulkDelete = async () => {
    const confirmed = await confirmDelete();
    if (!confirmed) return;

    bulkDelete.mutate(
      { userIds: Array.from(selectedIds) },
      {
        onSuccess: () => {
          setSelectedIds(new Set());
        },
      },
    );
  };

  const handleBulkRoleChange = (role: AccountRole) => {
    bulkUpdateRole.mutate(
      { userIds: Array.from(selectedIds), role },
      {
        onSuccess: () => {
          setSelectedIds(new Set());
          setBulkRoleDialogOpen(false);
        },
      },
    );
  };

  const getRoleBadgeVariant = (role: AccountRole) => {
    switch (role) {
      case AccountRole.OWNER:
        return "default";
      case AccountRole.MANAGER:
        return "secondary";
      default:
        return "outline";
    }
  };

  if (membersLoading) {
    return <div>Loading members...</div>;
  }

  return (
    <>
      <DeleteDialog />
      <TransferOwnerDialog />

      {/* Header row: + Member, Actions on left; Search on right */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button onClick={() => setInviteDialogOpen(true)}>
            <PlusIcon className="size-4 mr-2" />
            Member
          </Button>

          {/* Only show Actions dropdown for OWNER/MANAGER */}
          {(isOwner || isManager) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={!hasSelection}>
                  Actions
                  <ChevronDownIcon className="size-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => setBulkInviteDialogOpen(true)}
                  disabled={!hasSelection}
                >
                  <MapPinIcon className="size-4 mr-2" />
                  Invite to Location
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setBulkRoleDialogOpen(true)}
                  disabled={!hasSelection}
                >
                  <UserCogIcon className="size-4 mr-2" />
                  Change Account Role
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleBulkDelete}
                      disabled={!hasSelection}
                      className="text-destructive"
                    >
                      <Trash2Icon className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
      </div>

      {/* Members table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Checkbox column - only for OWNER/MANAGER */}
              {(isOwner || isManager) && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Main Location</TableHead>
              <TableHead className="text-center">Locations</TableHead>
              <TableHead>Account Role</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                {(isOwner || isManager) && (
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(member.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(member.id, !!checked)
                      }
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={member.image ?? undefined} />
                      <AvatarFallback>
                        {member.name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.email}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={member.mainWorkspace?.name ? "" : "text-muted-foreground"}>
                      {member.mainWorkspace?.name || "Not set"}
                    </span>
                    {/* Only show edit if user can edit this row */}
                    {(isOwner || isManager || member.id === currentUserId) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => handleEditMainLocation(member.id, member.mainWorkspace?.id)}
                      >
                        <PencilIcon className="size-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{member.locationCount}</Badge>
                </TableCell>
                <TableCell>
                  {/* OWNER badge - only OWNER can change another OWNER */}
                  {member.accountRole === AccountRole.OWNER && !isOwner ? (
                    <Badge variant={getRoleBadgeVariant(member.accountRole)}>
                      {member.accountRole}
                    </Badge>
                  ) : /* USER can only change their own role */
                  isUser && member.id !== currentUserId ? (
                    <Badge variant={getRoleBadgeVariant(member.accountRole)}>
                      {member.accountRole}
                    </Badge>
                  ) : (
                    <Select
                      value={member.accountRole}
                      onValueChange={(value) =>
                        handleRoleChange(member.id, value as AccountRole)
                      }
                      disabled={updateRole.isPending}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Only OWNER sees OWNER option */}
                        {isOwner && (
                          <SelectItem value={AccountRole.OWNER}>Owner</SelectItem>
                        )}
                        <SelectItem value={AccountRole.MANAGER}>
                          Manager
                        </SelectItem>
                        <SelectItem value={AccountRole.USER}>User</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  {/* Only show 3-dot menu if: current user is OWNER/MANAGER, OR this is the current user's own row; never for OWNER member unless current user is OWNER */}
                  {(isOwner || isManager || member.id === currentUserId) &&
                    member.accountRole !== AccountRole.OWNER && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* Edit Profile - only for own row or admins */}
                          {(member.id === currentUserId ||
                            isOwner ||
                            isManager) && (
                            <DropdownMenuItem
                              onClick={() => handleEditProfile(member.id)}
                            >
                              Edit Profile
                            </DropdownMenuItem>
                          )}
                          {/* Remove User - only for OWNER, not on own row */}
                          {isOwner && member.id !== currentUserId && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleRemoveUser(member.id)}
                                >
                                  Remove User
                                </DropdownMenuItem>
                              </>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Invite member dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Invite form coming soon...</p>
        </DialogContent>
      </Dialog>

      {/* Bulk role change dialog */}
      <Dialog open={bulkRoleDialogOpen} onOpenChange={setBulkRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Account Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Change role for {selectedIds.size} selected user(s)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleBulkRoleChange(AccountRole.MANAGER)}
                disabled={bulkUpdateRole.isPending}
              >
                Set as Manager
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkRoleChange(AccountRole.USER)}
                disabled={bulkUpdateRole.isPending}
              >
                Set as User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk invite to workspace dialog */}
      <Dialog
        open={bulkInviteDialogOpen}
        onOpenChange={setBulkInviteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite to Location</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Workspace selector coming soon...
          </p>
        </DialogContent>
      </Dialog>

      {/* Edit main location dialog */}
      <Dialog
        open={editMainLocationDialogOpen}
        onOpenChange={(open) => {
          setEditMainLocationDialogOpen(open);
          if (!open) {
            setEditingMemberId(null);
            setSelectedWorkspaceId(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Main Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {workspacesLoading ? (
              <div>Loading workspaces...</div>
            ) : (
              <Select
                value={selectedWorkspaceId ?? "none"}
                onValueChange={(value) =>
                  setSelectedWorkspaceId(value === "none" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not set</SelectItem>
                  {memberWorkspaces?.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditMainLocationDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveMainLocation}
                disabled={setMainWorkspace.isPending || workspacesLoading}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
