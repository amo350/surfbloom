import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export const useSuspenseMembers = (workspaceId: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.members.getByWorkspace.queryOptions({ workspaceId }),
  );
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.members.updateRole.mutationOptions({
      onSuccess: (_, variables) => {
        toast.success("Member role updated");
        queryClient.invalidateQueries(
          trpc.members.getByWorkspace.queryOptions({
            workspaceId: variables.workspaceId,
          }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to update role: ${error.message}`);
      },
    }),
  );
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.members.remove.mutationOptions({
      onSuccess: (_, variables) => {
        toast.success("Member removed");
        queryClient.invalidateQueries(
          trpc.members.getByWorkspace.queryOptions({
            workspaceId: variables.workspaceId,
          }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to remove member: ${error.message}`);
      },
    }),
  );
};
