import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useExecutionsParams } from "./use-executions-params";
import { ExecutionStatus } from "@/generated/prisma/enums";

export const useSuspenseExecutions = (workspaceId: string) => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();

  return useSuspenseQuery({
    ...trpc.executions.getMany.queryOptions({ ...params, workspaceId }),
    // Node status is realtime, but executions list is DB-backed; poll only while running.
    refetchInterval: (query) => {
      const items = (query.state.data as any)?.items as
        | Array<{ status: ExecutionStatus }>
        | undefined;
      const hasRunning =
        items?.some((e) => e.status === ExecutionStatus.RUNNING) ?? false;
      return hasRunning ? 1500 : false;
    },
  });
};

export const useSuspenseExecution = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery({
    ...trpc.executions.getOne.queryOptions({
      id,
    }),
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.status as
        | ExecutionStatus
        | undefined;
      return status === ExecutionStatus.RUNNING ? 1000 : false;
    },
  });
};
