import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

type ChannelFilter = "all" | "sms" | "email";

type ReportingFilters = {
  workspaceId?: string;
  days: number;
  channel: ChannelFilter;
};

export const useReportingOverview = (filters: ReportingFilters) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.analytics.getOverviewStats.queryOptions({
      workspaceId: filters.workspaceId,
      days: filters.days,
      channel: filters.channel,
    }),
  );
};

export const useReportingTimeSeries = (filters: ReportingFilters) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.analytics.getCampaignTimeSeries.queryOptions({
      workspaceId: filters.workspaceId,
      days: filters.days,
      channel: filters.channel,
    }),
  );
};

export const useReportingChannelBreakdown = (filters: {
  workspaceId?: string;
  days: number;
}) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.analytics.getChannelBreakdown.queryOptions({
      workspaceId: filters.workspaceId,
      days: filters.days,
    }),
  );
};

export const useReportingFunnel = (filters: ReportingFilters) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.analytics.getDeliveryFunnel.queryOptions({
      workspaceId: filters.workspaceId,
      days: filters.days,
      channel: filters.channel,
    }),
  );
};

export const useReportingTopCampaigns = (filters: {
  workspaceId?: string;
  days: number;
  channel: ChannelFilter;
  sortBy: "sent" | "delivered" | "replied" | "reply_rate";
  limit: number;
}) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.analytics.getTopCampaigns.queryOptions({
      workspaceId: filters.workspaceId,
      days: filters.days,
      channel: filters.channel,
      sortBy: filters.sortBy,
      limit: filters.limit,
    }),
  );
};

export const useReportingExportCsv = () => {
  const trpc = useTRPC();
  return useMutation(trpc.analytics.exportReportingCsv.mutationOptions());
};

export const useReportingSequences = (workspaceId?: string) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.sequences.getSequences.queryOptions({
      workspaceId,
    }),
  );
};

export const useReportingLocationComparison = () => {
  const trpc = useTRPC();
  return useQuery(trpc.campaigns.getCrossLocationStats.queryOptions());
};
