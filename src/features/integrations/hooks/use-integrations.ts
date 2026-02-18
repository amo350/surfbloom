// src/features/integrations/hooks/use-integrations.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useTwilioConfig = () => {
  const trpc = useTRPC();
  return useQuery(trpc.integrations.getTwilioConfig.queryOptions());
};

export const useSetupTwilio = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.integrations.setupTwilio.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.integrations.getTwilioConfig.queryKey(),
        });
      },
    }),
  );
};

export const useDisconnectTwilio = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.integrations.disconnectTwilio.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.integrations.getTwilioConfig.queryKey(),
        });
      },
    }),
  );
};

export const usePhoneNumbers = () => {
  const trpc = useTRPC();
  return useQuery(trpc.integrations.getPhoneNumbers.queryOptions());
};

export const useWorkspaceSmsNumber = (workspaceId: string) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.integrations.getWorkspaceSmsNumber.queryOptions({ workspaceId }),
    enabled: !!workspaceId,
  });
};

export const useSearchNumbers = () => {
  const trpc = useTRPC();
  return useMutation(trpc.integrations.searchNumbers.mutationOptions());
};

export const useProvisionNumber = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.integrations.provisionNumber.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.integrations.getPhoneNumbers.queryKey(),
        });
      },
    }),
  );
};

export const useRemoveNumber = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.integrations.removeNumber.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.integrations.getPhoneNumbers.queryKey(),
        });
      },
    }),
  );
};

export const useSendSms = () => {
  const trpc = useTRPC();
  return useMutation(trpc.integrations.sendSms.mutationOptions());
};
