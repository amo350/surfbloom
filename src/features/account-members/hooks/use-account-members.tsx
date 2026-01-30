import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { AccountRole } from "@/generated/prisma/enums";

// Define the member type based on what the router returns
export type AccountMember = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  accountRole: AccountRole;
  mainWorkspace: { id: string; name: string } | null;
  locationCount: number;
  createdAt: Date;
};

export const useAccountMembers = (search: string = "") => {
  const trpc = useTRPC();
  return useQuery<AccountMember[]>(
    trpc.accountMembers.getAll.queryOptions({ search }),
  );
};

export const useUpdateAccountRole = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (input: { userId: string; role: AccountRole }) =>
      trpc.accountMembers.updateRole.mutationOptions({}).mutationFn!(input),
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: ["accountMembers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkUpdateAccountRole = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (input: { userIds: string[]; role: AccountRole }) =>
      trpc.accountMembers.bulkUpdateRole.mutationOptions({}).mutationFn!(input),
    onSuccess: (data: { updated: number }) => {
      toast.success(`Updated ${data.updated} user(s)`);
      queryClient.invalidateQueries({ queryKey: ["accountMembers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkInviteToWorkspace = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (input: {
      userIds: string[];
      workspaceId: string;
      role?: AccountRole;
    }) =>
      trpc.accountMembers.bulkInviteToWorkspace.mutationOptions({}).mutationFn!(
        input,
      ),
    onSuccess: (data: { added: number }) => {
      toast.success(`Added ${data.added} user(s) to workspace`);
      queryClient.invalidateQueries({ queryKey: ["accountMembers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (input: { userIds: string[] }) =>
      trpc.accountMembers.bulkDelete.mutationOptions({}).mutationFn!(input),
    onSuccess: (data: { deleted: number }) => {
      toast.success(`Deleted ${data.deleted} user(s)`);
      queryClient.invalidateQueries({ queryKey: ["accountMembers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
