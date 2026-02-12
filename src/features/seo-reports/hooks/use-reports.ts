import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.seoReports.create.mutationOptions({
      onSuccess: () => {
        toast.success("Report generation started");
        queryClient.invalidateQueries(trpc.seoReports.getAll.queryFilter());
      },
      onError: (error) => {
        toast.error(`Failed to create report: ${error.message}`);
      },
    }),
  );
};

export const useReport = (reportId: string, workspaceId: string) => {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.seoReports.getOne.queryOptions({
      reportId,
      workspaceId,
    }),
    enabled: !!reportId && !!workspaceId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Poll while report is in progress
      if (
        status === "PENDING" ||
        status === "FETCHING" ||
        status === "ANALYZING"
      ) {
        return 3000;
      }
      return false;
    },
  });
};

export const useWorkspaceReports = (workspaceId: string) => {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.seoReports.getByWorkspace.queryOptions({ workspaceId }),
    enabled: !!workspaceId,
  });
};

export const useAllReports = () => {
  const trpc = useTRPC();
  return useQuery(trpc.seoReports.getAll.queryOptions());
};

export const useRetryReport = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.seoReports.retry.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          data.smartRetry
            ? "Re-analyzing report..."
            : "Retrying report generation...",
        );
        queryClient.invalidateQueries(trpc.seoReports.getAll.queryFilter());
        queryClient.invalidateQueries(trpc.seoReports.getOne.queryFilter());
      },
      onError: (error) => {
        toast.error(`Failed to retry report: ${error.message}`);
      },
    }),
  );
};

export const useCancelReport = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.seoReports.cancel.mutationOptions({
      onSuccess: () => {
        toast.success("Report cancelled");
        queryClient.invalidateQueries(trpc.seoReports.getAll.queryFilter());
      },
      onError: (error) => {
        toast.error(`Failed to cancel report: ${error.message}`);
      },
    }),
  );
};
