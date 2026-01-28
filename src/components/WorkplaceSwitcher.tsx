"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDownIcon, HomeIcon, PlusIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSuspenseWorkspaces, useSuspenseWorkspace } from "@/features/workspaces/hooks/use-workspaces";

export const WorkspaceSwitcher = () => {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;

  // Get current workspace
  const { data: currentWorkspace } = useSuspenseWorkspace(workspaceId);
  
  // Get all workspaces for the dropdown
  const { data: workspacesData } = useSuspenseWorkspaces();
  const otherWorkspaces = workspacesData.items.filter(w => w.id !== workspaceId);

  const handleWorkspaceSelect = (id: string) => {
    router.push(`/workspaces/${id}/workflows`);
  };

  const handleGoHome = () => {
    router.push("/index/locations");
  };

  const handleCreateWorkspace = () => {
    // Navigate to locations page which has the create modal
    // Or open a create modal here if you have one
    router.push("/index/locations");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          {/* Current workspace image */}
          {currentWorkspace.imageUrl ? (
            <Image
              src={currentWorkspace.imageUrl}
              alt={currentWorkspace.name}
              width={24}
              height={24}
              className="rounded-md object-cover"
            />
          ) : (
            <Avatar className="size-6">
              <AvatarFallback className="text-xs">
                {currentWorkspace.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          
          {/* Current workspace name */}
          <span className="font-medium truncate max-w-[150px]">
            {currentWorkspace.name}
          </span>
          
          {/* Down arrow */}
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        {/* Home row with create button */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuItem onClick={handleGoHome} className="flex-1 cursor-pointer">
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
              <TooltipContent>
                Create new location
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <DropdownMenuSeparator />

        {/* Workspace list - scrollable after 3 */}
        <div className="max-h-[144px] overflow-y-auto">
          {otherWorkspaces.length === 0 ? (
            <div className="px-2 py-3 text-sm text-muted-foreground text-center">
              No other locations
            </div>
          ) : (
            otherWorkspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleWorkspaceSelect(workspace.id)}
                className="cursor-pointer"
              >
                {workspace.imageUrl ? (
                  <Image
                    src={workspace.imageUrl}
                    alt={workspace.name}
                    width={20}
                    height={20}
                    className="rounded-md object-cover mr-2"
                  />
                ) : (
                  <Avatar className="size-5 mr-2">
                    <AvatarFallback className="text-xs">
                      {workspace.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="truncate">{workspace.name}</span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};