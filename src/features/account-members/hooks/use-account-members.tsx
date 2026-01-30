import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export const useAccountMembers = (search: string = "") => {
  const trpc = useTRPC();
  return useQuery(trpc.accountMembers.getAll.queryOptions({ search }));
};

export const useMemberWorkspaces = (userId: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.accountMembers.getMemberWorkspaces.queryOptions({
      userId: userId ?? "",
    }),
    enabled: !!userId,
  });
};

export const useUpdateAccountRole = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.accountMembers.updateRole.mutationOptions({
      onSuccess: () => {
        toast.success("Role updated");
        queryClient.invalidateQueries(trpc.accountMembers.getAll.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

export const useBulkUpdateAccountRole = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.accountMembers.bulkUpdateRole.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Updated ${data.updated} user(s)`);
        queryClient.invalidateQueries(trpc.accountMembers.getAll.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

export const useBulkInviteToWorkspace = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.accountMembers.bulkInviteToWorkspace.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Added ${data.added} user(s) to workspace`);
        queryClient.invalidateQueries(trpc.accountMembers.getAll.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.accountMembers.bulkDelete.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Deleted ${data.deleted} user(s)`);
        queryClient.invalidateQueries(trpc.accountMembers.getAll.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

export const useSetMainWorkspace = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.accountMembers.setMainWorkspace.mutationOptions({
      onSuccess: () => {
        toast.success("Main location updated");
        queryClient.invalidateQueries(trpc.accountMembers.getAll.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};
