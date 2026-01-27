"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import {
  BuildingIcon,
  MoreVerticalIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { AppHeader, AppHeaderActions } from "@/components/AppHeader";
import {
  EntityContainer,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/EntityComponents";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Workspace } from "@/generated/prisma/client";
import { useEntitySearch } from "@/hooks/use-entity-search";
import {
  useCreateWorkspace,
  useRemoveWorkspace,
  useSuspenseWorkspaces,
} from "../hooks/use-workspaces";
import { useWorkspacesParams } from "../hooks/use-workspaces-params";

const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>;

export const WorkspacesSearch = () => {
  const [params, setParams] = useWorkspacesParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });
  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search workspaces"
    />
  );
};

export const WorkspacesList = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const workspaces = useSuspenseWorkspaces();

  if (workspaces.data.items.length === 0) {
    return <WorkspacesEmpty />;
  }

  return (
    <>
      <CreateWorkspaceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.data.items.map((workspace) => (
          <WorkspaceCard key={workspace.id} data={workspace} />
        ))}
      </div>
    </>
  );
};

export const WorkspacesPageHeader = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [params, setParams] = useWorkspacesParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <>
      <CreateWorkspaceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <AppHeader>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PlusIcon className="size-4" />
          Add Workspace
        </Button>
        <AppHeaderActions>
          <EntitySearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search workspaces"
          />
        </AppHeaderActions>
      </AppHeader>
    </>
  );
};

export const WorkspacesContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <EntityContainer>{children}</EntityContainer>;
};

export const WorkspacesLoading = () => {
  return <LoadingView message="Loading workspaces..." />;
};

export const WorkspacesError = () => {
  return <ErrorView message="Error loading workspaces..." />;
};

export const WorkspacesEmpty = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <CreateWorkspaceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <BuildingIcon className="size-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">No workspaces yet</CardTitle>
            <CardDescription>
              Create your first workspace to get started managing workflows,
              tasks, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setDialogOpen(true)} size="lg">
              <PlusIcon className="size-4" />
              Add Workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export const WorkspaceCard = ({ data }: { data: Workspace }) => {
  const removeWorkspace = useRemoveWorkspace();

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeWorkspace.mutate({ id: data.id });
  };

  return (
    <Link href={`/workspaces/${data.id}/workflows`} prefetch>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <BuildingIcon className="size-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-base font-medium">
                {data.name}
              </CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreVerticalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleRemove}
                  disabled={removeWorkspace.isPending}
                >
                  <TrashIcon className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-xs">
            Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
            &bull; Created{" "}
            {formatDistanceToNow(data.createdAt, { addSuffix: true })}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
};

type CreateWorkspaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CreateWorkspaceDialog = ({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) => {
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();

  const form = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = (values: CreateWorkspaceFormValues) => {
    createWorkspace.mutate(values, {
      onSuccess: (data) => {
        onOpenChange(false);
        form.reset();
        router.push(`/workspaces/${data.id}/workflows`);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Create a new workspace</DialogTitle>
        <Card className="border-0 shadow-none">
          <CardHeader className="p-7 pb-0">
            <CardTitle className="text-xl font-bold">
              Create a new workspace
            </CardTitle>
          </CardHeader>
          <div className="px-7 py-4">
            <Separator />
          </div>
          <CardContent className="p-7 pt-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter workspace name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    size="lg"
                    variant="secondary"
                    onClick={() => onOpenChange(false)}
                    disabled={createWorkspace.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={createWorkspace.isPending}
                  >
                    {createWorkspace.isPending
                      ? "Creating..."
                      : "Create Workspace"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
