"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChevronDownIcon, HomeIcon, PlusIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { CreateWorkspaceForm } from "@/features/workspaces/components/workspaces";

export const WorkspaceSwitcher = () => {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const trpc = useTRPC();

  // Get current workspace
  const { data: currentWorkspace, isLoading: isLoadingCurrent } = useQuery(
    trpc.workspaces.getOne.queryOptions({ id: workspaceId }),
  );
  // Get all workspaces for the dropdown
  const { data: workspacesData, isLoading: isLoadingList } = useQuery(
    trpc.workspaces.getMany.queryOptions({
      page: 1,
      pageSize: 100,
      search: "",
    }),
  );

  // Local state
  const [searchValue, setSearchValue] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Handle loading state
  if (
    isLoadingCurrent ||
    isLoadingList ||
    !currentWorkspace ||
    !workspacesData
  ) {
    return (
      <div className="flex w-full items-center px-3.5 py-2">
        <Image
          src="/logo.png"
          alt="Logo"
          width={36}
          height={36}
          className="rounded-md object-cover"
        />
        <span className="ml-2 flex-1 truncate text-left font-medium">
          Surfing... 🏄
        </span>
      </div>
    );
  }

  // Filter workspaces based on search
  const otherWorkspaces = workspacesData.items.filter(
    (w) => w.id !== workspaceId,
  );
  const filteredWorkspaces = otherWorkspaces.filter((w) =>
    w.name.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const handleWorkspaceSelect = (id: string) => {
    router.push(`/workspaces/${id}/workflows`);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleCreateWorkspace = () => {
    setCreateDialogOpen(true);
  };

  return (
    <>
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new location</DialogTitle>
          </DialogHeader>
          <CreateWorkspaceForm
            onCancel={() => setCreateDialogOpen(false)}
            onSuccess={(newWorkspaceId) => {
              setCreateDialogOpen(false);
              router.push(`/workspaces/${newWorkspaceId}/workflows`);
            }}
          />
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex w-full items-center px-3.5 py-2 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors [transition-property:background-color,color] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <Image
              src="/logo.png"
              alt="Logo"
              width={36}
              height={36}
              className="rounded-md object-cover"
            />

            <span className="ml-2 flex-1 truncate text-left font-medium group-data-[collapsible=icon]:hidden">
              {currentWorkspace.name}
            </span>

            <ChevronDownIcon className="ml-auto size-7 pt-1.5 text-muted-foreground group-data-[collapsible=icon]:hidden" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64">
          {/* Home row with create button */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleGoHome();
              }}
              className="flex-1 cursor-pointer"
            >
              <HomeIcon className="size-4 mr-2" />
              Home
            </DropdownMenuItem>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={handleCreateWorkspace}
                  >
                    <PlusIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Create new location</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <DropdownMenuSeparator />

          {/* Search input */}
          <div className="px-2 py-1.5" onKeyDown={(e) => e.stopPropagation()}>
            <Input
              placeholder="Search locations..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="h-8"
            />
          </div>

          <DropdownMenuSeparator />

          {/* Workspace list - scrollable after 3, no images */}
          <div className="max-h-[144px] overflow-y-auto px-2">
            {filteredWorkspaces.length === 0 ? (
              <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                No locations found
              </div>
            ) : (
              filteredWorkspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onSelect={(e) => {
                    e.preventDefault();
                    handleWorkspaceSelect(workspace.id);
                  }}
                  className="cursor-pointer"
                >
                  <span className="truncate">{workspace.name}</span>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
