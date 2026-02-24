import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export const useGetTaskColumns = (workspaceId?: string) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.taskColumns.getMany.queryOptions({ workspaceId: workspaceId || "" }),
    enabled: Boolean(workspaceId),
  });
};

export const useUpdateTaskColumn = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.taskColumns.update.mutationOptions({
      onSuccess: () => {
        toast.success("Column updated");
        queryClient.invalidateQueries(trpc.taskColumns.getMany.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

export const useCreateTaskColumn = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.taskColumns.create.mutationOptions({
      onSuccess: () => {
        toast.success("Column added");
        queryClient.invalidateQueries(trpc.taskColumns.getMany.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

export const useDeleteTaskColumn = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.taskColumns.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Column removed");
        queryClient.invalidateQueries(trpc.taskColumns.getMany.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};
