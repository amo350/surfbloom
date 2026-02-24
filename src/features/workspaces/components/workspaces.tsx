"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import {
  BuildingIcon,
  Edit2Icon,
  MoreVerticalIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { AppHeader, AppHeaderActions } from "@/components/AppHeader";
import {
  EntityContainer,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/EntityComponents";
import { ImageUpload } from "@/components/ImageUpload";
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
import { useEntitySearch } from "@/hooks/use-entity-search";
import {
  useCreateWorkspace,
  useRemoveWorkspace,
  useSuspenseWorkspaces,
  useUpdateWorkspaceName,
} from "../hooks/use-workspaces";
import { useWorkspacesParams } from "../hooks/use-workspaces-params";

type WorkspaceListItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  imageUrl: z.string().optional(),
  googleAddress: z.string().trim().optional(),
});

type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>;

interface CreateWorkspaceFormProps {
  onCancel?: () => void;
  onSuccess?: (workspaceId: string) => void;
}

export const CreateWorkspaceForm = ({
  onCancel,
  onSuccess,
}: CreateWorkspaceFormProps) => {
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();

  const form = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      googleAddress: "",
    },
  });

  const handleSubmit = (values: CreateWorkspaceFormValues) => {
    createWorkspace.mutate(values, {
      onSuccess: (data) => {
        if (onSuccess) {
          onSuccess(data.id);
        } else {
          router.push(`/workspaces/${data.id}/workflows`);
        }
        form.reset();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
        <FormField
          control={form.control}
          name="googleAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Address</FormLabel>
              <FormControl>
                <Input placeholder="Paste from Google Maps" {...field} />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Copy the full address from Google Maps and paste it here
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  fallback={form.watch("name")?.[0]?.toUpperCase() || "W"}
                  disabled={createWorkspace.isPending}
                />
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
            onClick={() => onCancel?.()}
            disabled={createWorkspace.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={createWorkspace.isPending}>
            {createWorkspace.isPending ? "Creating..." : "Create Workspace"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

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
      <div className="w-full max-w-5xl mx-auto">
        <div className="mb-4">
          <h2 className="text-sm font-semibold mt-4">
            My Locations ({workspaces.data.items.length})
          </h2>
        </div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <AddWorkspaceButton />
          <div className="flex-1 flex justify-end">
            <SearchWorkspace />
          </div>
        </div>
        <Separator className="mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.data.items.map((workspace) => (
            <WorkspaceCard key={workspace.id} data={workspace} />
          ))}
        </div>
      </div>
    </>
  );
};

export const AddWorkspaceButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <CreateWorkspaceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <Button size="sm" onClick={() => setDialogOpen(true)}>
        <PlusIcon className="size-4" />
        Add Location
      </Button>
    </>
  );
};

export const SearchWorkspace = () => {
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

export const WorkspaceCard = ({ data }: { data: WorkspaceListItem }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const removeWorkspace = useRemoveWorkspace();

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditDialogOpen(true);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeWorkspace.mutate({ id: data.id });
  };

  return (
    <>
      <EditWorkspaceDialog
        workspace={data}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
      <Link href={`/workspaces/${data.id}/workflows`} prefetch>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex size-10 items-center justify-center rounded-lg bg-muted overflow-hidden">
                  {data.imageUrl ? (
                    <Image
                      src={data.imageUrl}
                      alt={data.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <BuildingIcon className="size-5 text-muted-foreground" />
                  )}
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
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit2Icon className="size-4" />
                    Edit
                  </DropdownMenuItem>
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
    </>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden">
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
            <CreateWorkspaceForm
              onCancel={() => onOpenChange(false)}
              onSuccess={(workspaceId) => {
                onOpenChange(false);
                router.push(`/workspaces/${workspaceId}/workflows`);
              }}
            />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

type EditWorkspaceDialogProps = {
  workspace: WorkspaceListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EditWorkspaceDialog = ({
  workspace,
  open,
  onOpenChange,
}: EditWorkspaceDialogProps) => {
  const updateWorkspace = useUpdateWorkspaceName();

  const form = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: workspace.name,
      imageUrl: workspace.imageUrl || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: workspace.name,
        imageUrl: workspace.imageUrl || "",
      });
    }
  }, [open, workspace.name, workspace.imageUrl, form]);

  const handleSubmit = (values: CreateWorkspaceFormValues) => {
    updateWorkspace.mutate(
      {
        id: workspace.id,
        name: values.name,
        imageUrl: values.imageUrl,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Edit workspace</DialogTitle>
        <Card className="border-0 shadow-none">
          <CardHeader className="p-7 pb-0">
            <CardTitle className="text-xl font-bold">Edit workspace</CardTitle>
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
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          fallback={
                            form.watch("name")?.[0]?.toUpperCase() || "W"
                          }
                          disabled={updateWorkspace.isPending}
                        />
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
                    disabled={updateWorkspace.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={updateWorkspace.isPending}
                  >
                    {updateWorkspace.isPending ? "Saving..." : "Save Changes"}
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
