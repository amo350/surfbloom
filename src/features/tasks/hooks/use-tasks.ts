import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export const useGetTasks = (input: {
  workspaceId: string;
  columnId?: string;
  assigneeId?: string;
  search?: string;
}) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.tasks.getMany.queryOptions(input),
    placeholderData: (previousData) => previousData,
  });
};

export const useGetTask = (id: string, workspaceId: string) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.tasks.getOne.queryOptions({ id, workspaceId }),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.tasks.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.tasks.getMany.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.tasks.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.tasks.getMany.queryFilter());
        queryClient.invalidateQueries(trpc.tasks.getOne.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.tasks.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Task deleted");
        queryClient.invalidateQueries(trpc.tasks.getMany.queryFilter());
        queryClient.invalidateQueries(trpc.tasks.getOne.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

export const useBulkDeleteTasks = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.tasks.bulkRemove.mutationOptions({
      onSuccess: (_, variables) => {
        const count = variables.ids.length;
        toast.success(`${count} task${count !== 1 ? "s" : ""} deleted`);
        queryClient.invalidateQueries(trpc.tasks.getMany.queryFilter());
        queryClient.invalidateQueries(trpc.tasks.getOne.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

export const useBulkUpdateTaskPositions = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.tasks.bulkUpdatePositions.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.tasks.getMany.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};
