import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useWorkspacesParams } from "./use-workspaces-params";

export const useSuspenseWorkspaces = () => {
  const trpc = useTRPC();
  const [params] = useWorkspacesParams();

  return useSuspenseQuery(trpc.workspaces.getMany.queryOptions(params));
};

export const useSuspenseWorkspace = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workspaces.getOne.queryOptions({ id }));
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  return useMutation(
    trpc.workspaces.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workspace "${data.name}" created`);
        queryClient.invalidateQueries(trpc.workspaces.getMany.queryFilter());
      },
      onError: (error) => {
        toast.error(`Failed to create workspace: ${error.message}`);
      },
    }),
  );
};

export const useRemoveWorkspace = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  return useMutation(
    trpc.workspaces.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workspace "${data.name}" removed`);
        queryClient.invalidateQueries(trpc.workspaces.getMany.queryFilter());
      },
      onError: (error) => {
        toast.error(`Failed to remove workspace: ${error.message}`);
      },
    }),
  );
};

export const useUpdateWorkspaceName = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  return useMutation(
    trpc.workspaces.updateName.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workspace renamed to "${data.name}"`);
        queryClient.invalidateQueries(trpc.workspaces.getMany.queryFilter());
        queryClient.invalidateQueries(
          trpc.workspaces.getOne.queryFilter({ id: data.id }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to update workspace: ${error.message}`);
      },
    }),
  );
};

export const useJoinWorkspace = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workspaces.join.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Joined ${data.name}`);
        queryClient.invalidateQueries(trpc.workspaces.getMany.queryFilter());
      },
      onError: (error) => {
        toast.error(`Failed to join workspace: ${error.message}`);
      },
    }),
  );
};

export const useResetInviteCode = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workspaces.resetInviteCode.mutationOptions({
      onSuccess: (data) => {
        toast.success("Invite code reset");
        queryClient.invalidateQueries(
          trpc.workspaces.getOne.queryOptions({ id: data.id }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to reset invite code: ${error.message}`);
      },
    }),
  );
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workspaces.update.mutationOptions({
      onSuccess: (data) => {
        toast.success("Workspace updated");
        queryClient.invalidateQueries(trpc.workspaces.getMany.queryFilter());
        queryClient.invalidateQueries(
          trpc.workspaces.getOne.queryOptions({ id: data.id }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to update workspace: ${error.message}`);
      },
    }),
  );
};
