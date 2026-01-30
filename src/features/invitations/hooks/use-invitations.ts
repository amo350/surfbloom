import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export const useInvitations = (workspaceId: string) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.invitations.getByWorkspace.queryOptions({ workspaceId }),
  );
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.invitations.create.mutationOptions({
      onSuccess: (data, variables) => {
        toast.success(`Invitation sent to ${variables.email}`);
        queryClient.invalidateQueries(
          trpc.invitations.getByWorkspace.queryOptions({
            workspaceId: variables.workspaceId,
          }),
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

export const useRemoveInvitation = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.invitations.remove.mutationOptions({
      onSuccess: (_, variables) => {
        toast.success("Invitation cancelled");
        queryClient.invalidateQueries(
          trpc.invitations.getByWorkspace.queryOptions({
            workspaceId: variables.workspaceId,
          }),
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

export const useAcceptPendingInvitations = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.invitations.acceptPending.mutationOptions({
      onSuccess: (data) => {
        if (data.accepted > 0) {
          toast.success(`Joined ${data.accepted} workspace(s)`);
          queryClient.invalidateQueries(trpc.workspaces.getMany.queryFilter());
        }
      },
    }),
  );
};
