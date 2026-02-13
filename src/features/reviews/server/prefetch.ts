import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type Input = inferInput<typeof trpc.reviews.getMany>;

export const prefetchReviews = (params: Input) => {
  return prefetch(trpc.reviews.getMany.queryOptions(params));
};

export const prefetchReviewStats = (workspaceId: string) => {
  return prefetch(trpc.reviews.getStats.queryOptions({ workspaceId }));
};
