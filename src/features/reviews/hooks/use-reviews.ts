import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { reviewsParams } from "../params";

export const useReviewsParams = () => {
  return useQueryStates(reviewsParams);
};

export const useSuspenseReviews = (workspaceId: string) => {
  const trpc = useTRPC();
  const [params] = useReviewsParams();

  return useSuspenseQuery(
    trpc.reviews.getMany.queryOptions({
      workspaceId,
      page: params.page,
      pageSize: 12,
      rating: params.rating ?? undefined,
      hasResponse:
        params.response === "responded"
          ? true
          : params.response === "unresponded"
            ? false
            : undefined,
      sortBy: params.sort,
    }),
  );
};

export const useReviewStats = (workspaceId: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.reviews.getStats.queryOptions({ workspaceId }),
  );
};

export const useSyncReviews = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.reviews.sync.mutationOptions({
      onSuccess: () => {
        toast.success("Review sync started — this may take a minute");
        setTimeout(() => {
          queryClient.invalidateQueries(trpc.reviews.getMany.queryFilter());
          queryClient.invalidateQueries(trpc.reviews.getStats.queryFilter());
        }, 5000);
      },
      onError: (error) => {
        toast.error(`Sync failed: ${error.message}`);
      },
    }),
  );
};
