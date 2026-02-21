import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useGenerateMessage = () => {
  const trpc = useTRPC();
  return useMutation(trpc.campaignAi.generateMessage.mutationOptions());
};

export const useImproveMessage = () => {
  const trpc = useTRPC();
  return useMutation(trpc.campaignAi.improveMessage.mutationOptions());
};
