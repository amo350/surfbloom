"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  useCreateReport,
  useAllReports,
  useCancelReport,
} from "@/features/seo-reports/hooks/use-reports";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Waves,
  TrendingUp,
  Star,
  MapPin,
  BarChart3,
  Loader2,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Settings,
  StopCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function SeoScorePage() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const router = useRouter();

  const trpc = useTRPC();
  const { data: workspacesData, isLoading: workspacesLoading } = useQuery(
    trpc.workspaces.getMany.queryOptions({}),
  );
  const workspaces = workspacesData?.items;
  const { data: allReports, isLoading: reportsLoading } = useAllReports();
  const createReport = useCreateReport();
  const cancelReport = useCancelReport();

  const selectedWorkspace = workspaces?.find(
    (w) => w.id === selectedWorkspaceId,
  );
  const hasLocationInfo = !!(
    selectedWorkspace?.city || selectedWorkspace?.address
  );

  // Build query from workspace data
  const buildQuery = (): string | null => {
    if (!selectedWorkspace) return null;
    const parts = [selectedWorkspace.name];
    if (selectedWorkspace.address) parts.push(selectedWorkspace.address);
    if (selectedWorkspace.city) parts.push(selectedWorkspace.city);
    if (selectedWorkspace.state) parts.push(selectedWorkspace.state);
    // Need at least name + some location context
    if (!selectedWorkspace.city && !selectedWorkspace.address) return null;
    return parts.join(", ");
  };

  const query = buildQuery();

  const handleGenerate = async () => {
    if (!query || !selectedWorkspaceId || createReport.isPending) return;

    const result = await createReport.mutateAsync({
      workspaceId: selectedWorkspaceId,
      query,
    });

    router.push(
      `/index/seo-score/${result.reportId}?ws=${selectedWorkspaceId}`,
    );
  };

  return (
    <div className="min-h-[calc(100vh-49px)] bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Hero Card */}
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-b from-white/90 via-amber-50/50 to-teal-50/70 dark:from-gray-900/90 dark:via-amber-950/20 dark:to-teal-950/30 backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-teal-400 via-amber-400 to-teal-400 opacity-80" />

            <div className="absolute inset-x-0 bottom-0 h-32 opacity-[0.06] pointer-events-none">
              <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <path
                  d="M0,60 C150,20 350,100 600,60 C850,20 1050,100 1200,60 L1200,120 L0,120 Z"
                  fill="currentColor"
                  className="text-teal-500"
                />
                <path
                  d="M0,80 C200,40 400,110 600,80 C800,50 1000,110 1200,80 L1200,120 L0,120 Z"
                  fill="currentColor"
                  className="text-amber-500"
                />
              </svg>
            </div>

            <CardHeader className="text-center pb-4 relative pt-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/25">
                  <Waves className="w-6 h-6" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  SEO Score Report
                </CardTitle>
              </div>
              <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Select a location to generate a{" "}
                <span className="font-semibold text-foreground">
                  comprehensive visibility and reputation analysis
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="relative pb-8">
              <div className="space-y-4 max-w-2xl mx-auto">
                {/* Workspace selector */}
                <div className="flex justify-center">
                  <Select
                    value={selectedWorkspaceId}
                    onValueChange={setSelectedWorkspaceId}
                    disabled={workspacesLoading}
                  >
                    <SelectTrigger className="h-12 w-full max-w-md border-2 border-amber-200/60 dark:border-amber-800/30 focus:border-teal-400 bg-white/90 dark:bg-gray-900/80 rounded-xl">
                      <SelectValue
                        placeholder={
                          workspacesLoading
                            ? "Loading locations..."
                            : "Select a location"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces?.map((workspace) => (
                        <SelectItem key={workspace.id} value={workspace.id}>
                          <div className="flex items-center gap-2">
                            <span>{workspace.name}</span>
                            {workspace.city && workspace.state && (
                              <span className="text-muted-foreground text-xs">
                                — {workspace.city}, {workspace.state}
                              </span>
                            )}
                            {!workspace.city && !workspace.address && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      No address on file for this location.
                                      Add one in Settings so we can auto-fill
                                      the search and verify the right business.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location preview + generate button */}
                {selectedWorkspace && (
                  <div className="space-y-3">
                    {hasLocationInfo ? (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-teal-50/50 dark:bg-teal-950/10 border border-teal-200/40 dark:border-teal-800/20">
                        <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        <p className="text-sm text-teal-700 dark:text-teal-300">
                          {query}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-800/20">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                            Missing location information
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                            Add an address in your location settings before
                            generating a report.
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-1 text-amber-700 dark:text-amber-300"
                            onClick={() =>
                              router.push(
                                `/workspaces/${selectedWorkspaceId}/settings`,
                              )
                            }
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            Go to Settings
                          </Button>
                        </div>
                      </div>
                    )}

                    <Button
                      size="lg"
                      className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 border-0 shadow-lg hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300 group font-semibold rounded-xl"
                      disabled={
                        createReport.isPending || !query || !hasLocationInfo
                      }
                      onClick={handleGenerate}
                    >
                      {createReport.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Starting analysis...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* What we analyze */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-5 border-t border-amber-200/40 dark:border-amber-800/20">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-teal-400" />
                    <span>Google Business Profile</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Review Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                    <span>Local Visibility</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>Social Presence</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-amber-200/40 dark:border-amber-800/20 bg-gradient-to-br from-white/90 to-amber-50/50 dark:from-gray-900/80 dark:to-amber-950/20 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                    <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-lg">Visibility Score</CardTitle>
                </div>
                <CardDescription>
                  Local Pack ranking factors — GBP completeness, website
                  signals, citations, links, and social presence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-orange-400/60 dark:text-orange-500/40">
                    --
                  </span>
                  <span className="text-lg text-orange-400/60 dark:text-orange-500/40">
                    / 100
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-teal-200/40 dark:border-teal-800/20 bg-gradient-to-br from-white/90 to-teal-50/50 dark:from-gray-900/80 dark:to-teal-950/20 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30">
                    <Star className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <CardTitle className="text-lg">Reputation Score</CardTitle>
                </div>
                <CardDescription>
                  Review health — rating, volume, recency, text quality, and
                  owner response rate across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-teal-300/50 dark:text-teal-700/40">
                    --
                  </span>
                  <span className="text-lg text-teal-300/50 dark:text-teal-700/40">
                    / 100
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <Card className="border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-500" />
                <CardTitle className="text-xl">Recent Reports</CardTitle>
              </div>
              <CardDescription>
                Track the progress and results of your SEO analysis reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Loading reports...
                  </span>
                </div>
              ) : !allReports || allReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reports yet. Select a location and generate your first one
                  above.
                </div>
              ) : (
                <div className="divide-y">
                  {allReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 -mx-6 px-6 transition-colors"
                      onClick={() =>
                        router.push(
                          `/index/seo-score/${report.id}?ws=${report.workspaceId}`,
                        )
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ReportStatusIcon status={report.status} />
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {report.workspace?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {report.workspace?.city && report.workspace?.state
                              ? `${report.workspace.city}, ${report.workspace.state}`
                              : "Location pending..."}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {(report.status === "PENDING" ||
                          report.status === "FETCHING" ||
                          report.status === "ANALYZING") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                            disabled={cancelReport.isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelReport.mutate({
                                reportId: report.id,
                                workspaceId: report.workspaceId,
                              });
                            }}
                            title="Cancel report"
                          >
                            <StopCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {report.status === "COMPLETED" && (
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-amber-600 font-semibold">
                              {report.visibilityScore?.toFixed(0) ?? "--"}
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-teal-600 font-semibold">
                              {report.reputationScore?.toFixed(0) ?? "--"}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(report.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ReportStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />;
    case "FAILED":
      return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
    case "PENDING":
    case "FETCHING":
    case "ANALYZING":
      return (
        <Loader2 className="w-4 h-4 animate-spin text-teal-500 shrink-0" />
      );
    default:
      return <Clock className="w-4 h-4 text-muted-foreground shrink-0" />;
  }
}
