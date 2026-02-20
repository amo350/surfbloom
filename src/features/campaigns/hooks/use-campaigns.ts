import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

// ─── QUERIES ─────────────────────────────────────────

export const useCampaigns = (filters: {
  workspaceId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.campaigns.getCampaigns.queryOptions({
      workspaceId: filters.workspaceId,
      status: filters.status as any,
      page: filters.page || 1,
      pageSize: filters.pageSize || 20,
    }),
  );
};

export const useCampaign = (id: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.campaigns.getCampaign.queryOptions({ id: id! }),
    enabled: !!id,
  });
};

export const useCampaignGroup = (id: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.campaigns.getCampaignGroup.queryOptions({ id: id! }),
    enabled: !!id,
  });
};

export const useAudiencePreview = (filters: {
  workspaceId: string;
  audienceType?: string;
  audienceStage?: string;
  audienceCategoryId?: string;
  audienceInactiveDays?: number;
  frequencyCapDays?: number;
  enabled?: boolean;
}) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.campaigns.previewAudience.queryOptions({
      workspaceId: filters.workspaceId,
      audienceType: filters.audienceType as any,
      audienceStage: filters.audienceStage,
      audienceCategoryId: filters.audienceCategoryId,
      audienceInactiveDays: filters.audienceInactiveDays,
      frequencyCapDays: filters.frequencyCapDays,
    }),
    enabled: filters.enabled !== false && !!filters.workspaceId,
  });
};

export const useRecipients = (filters: {
  campaignId: string | null;
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.campaigns.getRecipients.queryOptions({
      campaignId: filters.campaignId!,
      status: filters.status,
      page: filters.page || 1,
      pageSize: filters.pageSize || 20,
    }),
    enabled: !!filters.campaignId,
  });
};

// ─── MUTATIONS ───────────────────────────────────────

export const useCreateCampaign = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.campaigns.createCampaign.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.campaigns.getCampaigns.queryKey(),
        });
      },
    }),
  );
};

export const useCreateCampaignGroup = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.campaigns.createCampaignGroup.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.campaigns.getCampaigns.queryKey(),
        });
      },
    }),
  );
};

export const useUpdateCampaign = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.campaigns.updateCampaign.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.campaigns.getCampaigns.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.campaigns.getCampaign.queryKey({ id: variables.id }),
        });
      },
    }),
  );
};

export const useDeleteCampaign = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.campaigns.deleteCampaign.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.campaigns.getCampaigns.queryKey(),
        });
      },
    }),
  );
};

export const useLaunchCampaign = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.campaigns.launchCampaign.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.campaigns.getCampaigns.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.campaigns.getCampaign.queryKey({ id: variables.id }),
        });
      },
    }),
  );
};

export const usePauseCampaign = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.campaigns.pauseCampaign.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.campaigns.getCampaigns.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.campaigns.getCampaign.queryKey({ id: variables.id }),
        });
      },
    }),
  );
};

export const useResumeCampaign = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.campaigns.resumeCampaign.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.campaigns.getCampaigns.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.campaigns.getCampaign.queryKey({ id: variables.id }),
        });
      },
    }),
  );
};

export const useCancelCampaign = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.campaigns.cancelCampaign.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.campaigns.getCampaigns.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.campaigns.getCampaign.queryKey({ id: variables.id }),
        });
      },
    }),
  );
};
