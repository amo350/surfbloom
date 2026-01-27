import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type Input = inferInput<typeof trpc.workspaces.getMany>;

export const prefetchWorkspaces = (params: Input) => {
  return prefetch(trpc.workspaces.getMany.queryOptions(params));
};

export const prefetchWorkspace = (id: string) => {
  return prefetch(trpc.workspaces.getOne.queryOptions({ id }));
};
