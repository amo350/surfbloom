import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useKeywords = (workspaceId?: string) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.keywords.getKeywords.queryOptions({
      workspaceId,
    }),
  );
};

export const useCreateKeyword = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.keywords.createKeyword.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.keywords.getKeywords.queryKey(),
        });
      },
    }),
  );
};

export const useUpdateKeyword = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.keywords.updateKeyword.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.keywords.getKeywords.queryKey(),
        });
      },
    }),
  );
};

export const useDeleteKeyword = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.keywords.deleteKeyword.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.keywords.getKeywords.queryKey(),
        });
      },
    }),
  );
};
