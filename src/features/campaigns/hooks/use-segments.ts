import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

// ─── QUERIES ─────────────────────────────────────────

export const useSegments = () => {
  const trpc = useTRPC();
  return useQuery(trpc.segments.getSegments.queryOptions());
};

// ─── MUTATIONS ───────────────────────────────────────

export const useCreateSegment = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.segments.createSegment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.segments.getSegments.queryKey(),
        });
      },
    }),
  );
};

export const useUpdateSegment = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.segments.updateSegment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.segments.getSegments.queryKey(),
        });
      },
    }),
  );
};

export const useDeleteSegment = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.segments.deleteSegment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.segments.getSegments.queryKey(),
        });
      },
    }),
  );
};
