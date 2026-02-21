import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useCampaignLinks = (campaignId: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.campaignLinks.getCampaignLinks.queryOptions({
      campaignId: campaignId!,
    }),
    enabled: !!campaignId,
  });
};

export const useLinkClicks = (linkId: string | null, page: number = 1) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.campaignLinks.getLinkClicks.queryOptions({
      linkId: linkId!,
      page,
    }),
    enabled: !!linkId,
  });
};
