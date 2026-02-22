import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useWebhookEndpoints = (workspaceId: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.webhooks.getEndpoints.queryOptions({ workspaceId }));
};

export const useCreateWebhookEndpoint = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.webhooks.createEndpoint.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.webhooks.getEndpoints.queryKey() });
      },
    }),
  );
};

export const useUpdateWebhookEndpoint = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.webhooks.updateEndpoint.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.webhooks.getEndpoints.queryKey() });
      },
    }),
  );
};

export const useDeleteWebhookEndpoint = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.webhooks.deleteEndpoint.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.webhooks.getEndpoints.queryKey() });
      },
    }),
  );
};

export const useRotateWebhookSecret = () => {
  const trpc = useTRPC();
  const qc = useQueryClient();
  return useMutation(
    trpc.webhooks.rotateSecret.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: trpc.webhooks.getEndpoints.queryKey() });
      },
    }),
  );
};

export const useWebhookDeliveries = (endpointId: string | null, page = 1) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.webhooks.getDeliveries.queryOptions({
      endpointId: endpointId!,
      page,
    }),
    enabled: !!endpointId,
  });
};

export const useWebhookEvents = () => {
  const trpc = useTRPC();
  return useQuery(trpc.webhooks.getAvailableEvents.queryOptions());
};
