import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useWorkflowsParams } from "./use-workflows-params";

export const useSuspenseWorkflows = (workspaceId: string) => {
  const trpc = useTRPC();
  const [params] = useWorkflowsParams();

  return useSuspenseQuery(
    trpc.workflows.getMany.queryOptions({ ...params, workspaceId }),
  );
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  return useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} created`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryFilter());
      },
      onError: (error) => {
        toast.error(`Failed to create workflow ${error.message}`);
      },
    }),
  );
};

export const useRemoveWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} was removed`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryFilter());
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryFilter({ id: data.id }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to remove workflow ${error.message}`);
      },
    }),
  );
};

export const useSuspenseWorkflow = (id: string, workspaceId: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.workflows.getOne.queryOptions({
      id,
      workspaceId,
    }),
  );
};

export const useUpdateWorkflowName = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  return useMutation(
    trpc.workflows.updateName.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} updated`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryFilter());
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryFilter({ id: data.id }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to update workflow ${error.message}`);
      },
    }),
  );
};

//hook to update workflow

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  return useMutation(
    trpc.workflows.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} saved`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryFilter());
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryFilter({ id: data.id }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to save workflow ${error.message}`);
      },
    }),
  );
};
//execute hook workflow
export const useExecuteWorkflow = () => {
  const trpc = useTRPC();
  return useMutation(
    trpc.workflows.execute.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} executed`);
      },
      onError: (error) => {
        toast.error(`Failed to execute workflow ${error.message}`);
      },
    }),
  );
};
