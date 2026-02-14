"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Waves,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useReport,
  useRetryReport,
} from "@/features/seo-reports/hooks/use-reports";
import type {
  Competitor,
  Competitors,
  Recommendation,
  ReputationBreakdown,
  Strength,
  Verification,
  VisibilityBreakdown,
  Weakness,
} from "@/features/seo-reports/lib/report-schema";

// =============================================
// Status Stepper
// =============================================

const STEPS = [
  { key: "PENDING", label: "Queued" },
  { key: "FETCHING", label: "Fetching Data" },
  { key: "ANALYZING", label: "AI Analysis" },
  { key: "COMPLETED", label: "Complete" },
] as const;

function StatusStepper({ status }: { status: string }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const isFailed = status === "FAILED";

  return (
    <div className="flex items-center gap-2 w-full max-w-md mx-auto">
      {STEPS.map((step, i) => {
        const isActive = i === currentIndex;
        const isDone = i < currentIndex || status === "COMPLETED";
        const isFailedStep = isFailed && i === currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isFailedStep
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : isDone
                      ? "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
                      : isActive
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse"
                        : "bg-muted text-muted-foreground"
                }`}
              >
                {isFailedStep ? (
                  <XCircle className="w-4 h-4" />
                ) : isDone ? (
                  <CheckCircle className="w-4 h-4" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[11px] font-medium ${
                  isFailedStep
                    ? "text-red-600 dark:text-red-400"
                    : isDone
                      ? "text-teal-600 dark:text-teal-400"
                      : isActive
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 -mt-5 ${
                  isDone ? "bg-teal-300 dark:bg-teal-700" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// =============================================
// Score Ring
// =============================================

function ScoreRing({
  score,
  label,
  color,
}: {
  score: number;
  label: string;
  color: "teal" | "amber";
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colorClasses =
    color === "teal"
      ? {
          stroke: "stroke-teal-500",
          text: "text-teal-600 dark:text-teal-400",
          bg: "from-teal-50 to-white dark:from-teal-950/20 dark:to-gray-900",
        }
      : {
          stroke: "stroke-amber-500",
          text: "text-amber-600 dark:text-amber-400",
          bg: "from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-900",
        };

  return (
    <div
      className={`flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-b ${colorClasses.bg}`}
    >
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="8"
            className="stroke-muted"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${colorClasses.stroke} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${colorClasses.text}`}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      <span className="text-sm font-semibold text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

// =============================================
// Verification Banner
// =============================================

function VerificationBanner({ verification }: { verification: Verification }) {
  if (!verification.needsReview && verification.confidence === "high") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30">
        <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            Business verified
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            The business found matches your location information.
          </p>
        </div>
      </div>
    );
  }

  if (!verification.matched) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
        <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            Possible mismatch detected
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mb-2">
            The business found may not match your location. Please verify:
          </p>
          <div className="space-y-1">
            {verification.mismatches.map((m, i) => (
              <div key={i} className="text-xs">
                <span className="font-medium capitalize text-red-700 dark:text-red-300">
                  {m.field}:
                </span>{" "}
                <span className="text-red-600 dark:text-red-400">
                  Your info: &quot;{m.workspace || "Not set"}&quot; → Found:
                  &quot;{m.outscraper || "N/A"}&quot;
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
      <ShieldQuestion className="w-5 h-5 text-amber-600 shrink-0" />
      <div>
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          Verification incomplete
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Add your address in Location Settings to verify this is the correct
          business.
        </p>
      </div>
    </div>
  );
}

// =============================================
// Visibility Breakdown
// =============================================

function VisibilityBreakdownCard({
  breakdown,
}: {
  breakdown: VisibilityBreakdown;
}) {
  const sections = [
    {
      label: "Google Business Profile",
      score: breakdown.gbp.score,
      max: 32,
      color: "bg-teal-500",
    },
    {
      label: "Reviews",
      score: breakdown.reviews.score,
      max: 20,
      color: "bg-amber-500",
    },
    {
      label: "Website & On-Page",
      score: breakdown.website.score,
      max: 15,
      color: "bg-blue-500",
    },
    {
      label: "Behavioral Signals",
      score: breakdown.behavioral.score,
      max: 9,
      color: "bg-purple-500",
      unmeasured: !breakdown.behavioral.measured,
    },
    {
      label: "Backlinks",
      score: breakdown.links.score,
      max: 8,
      color: "bg-indigo-500",
    },
    {
      label: "Citations & NAP",
      score: breakdown.citations.score,
      max: 6,
      color: "bg-cyan-500",
    },
    {
      label: "Personalization",
      score: breakdown.personalization.score,
      max: 6,
      color: "bg-pink-500",
      unmeasured: !breakdown.personalization.measured,
    },
    {
      label: "Social Presence",
      score: breakdown.social.score,
      max: 4,
      color: "bg-orange-500",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <CardTitle className="text-lg">Visibility Breakdown</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">
                {section.label}
                {section.unmeasured && (
                  <span className="text-xs ml-1 text-amber-500">
                    (unmeasured)
                  </span>
                )}
              </span>
              <span className="font-semibold">
                {section.score}/{section.max}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${section.color} transition-all duration-700`}
                style={{
                  width: `${(section.score / section.max) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// =============================================
// Reputation Breakdown
// =============================================

function ReputationBreakdownCard({
  breakdown,
}: {
  breakdown: ReputationBreakdown;
}) {
  const google = breakdown.googleReviews;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-teal-500" />
          <CardTitle className="text-lg">Reputation Breakdown</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Google Reviews</span>
            <span className="font-semibold">{google.score}/90</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-700"
              style={{ width: `${(google.score / 90) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-muted-foreground text-xs">Rating</p>
            <p className="font-semibold text-lg">{google.rating ?? "N/A"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-muted-foreground text-xs">Total Reviews</p>
            <p className="font-semibold text-lg">
              {google.reviewCount ?? "N/A"}
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Other Platforms</span>
            <span className="font-semibold">
              {breakdown.otherReviews.score}/10
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-500 transition-all duration-700"
              style={{
                width: `${(breakdown.otherReviews.score / 10) * 100}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================
// Competitors Table
// =============================================

function CompetitorsCard({ competitors }: { competitors: Competitors }) {
  const [expanded, setExpanded] = useState(false);
  const visibleResults = expanded
    ? competitors.results
    : competitors.results.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          <CardTitle className="text-lg">Map Pack Competitors</CardTitle>
        </div>
        <CardDescription>
          Searched &quot;{competitors.query}&quot; — your rank:{" "}
          <span className="font-semibold text-foreground">
            {competitors.selfRank
              ? `#${competitors.selfRank} of ${competitors.results.length}`
              : "Not in top results"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Peer stats */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground text-xs">Peer Avg Rating</p>
              <p className="font-semibold text-lg">
                {competitors.peerAverageRating ?? "N/A"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground text-xs">Peer Avg Reviews</p>
              <p className="font-semibold text-lg">
                {competitors.peerAverageReviewCount ?? "N/A"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground text-xs">
                Peer Median Reviews
              </p>
              <p className="font-semibold text-lg">
                {competitors.peerMedianReviewCount ?? "N/A"}
              </p>
            </div>
          </div>

          {/* Competitor list */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-2.5 font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground">
                    Business
                  </th>
                  <th className="text-right p-2.5 font-medium text-muted-foreground">
                    Rating
                  </th>
                  <th className="text-right p-2.5 font-medium text-muted-foreground">
                    Reviews
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleResults.map((comp) => (
                  <tr
                    key={comp.rank}
                    className={`border-b last:border-0 ${
                      comp.isSelf
                        ? "bg-teal-50 dark:bg-teal-950/20 font-semibold"
                        : ""
                    }`}
                  >
                    <td className="p-2.5">{comp.rank}</td>
                    <td className="p-2.5">
                      {comp.name}
                      {comp.isSelf && (
                        <span className="text-xs ml-1.5 text-teal-600 dark:text-teal-400">
                          (You)
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-right">{comp.rating ?? "—"}</td>
                    <td className="p-2.5 text-right">
                      {comp.reviewCount ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {competitors.results.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" /> Show all{" "}
                  {competitors.results.length}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================
// Insights Cards
// =============================================

function InsightsSection({
  strengths,
  weaknesses,
  recommendations,
}: {
  strengths: Strength[];
  weaknesses: Weakness[];
  recommendations: Recommendation[];
}) {
  return (
    <div className="space-y-6">
      {/* Strengths */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-500" />
            <CardTitle className="text-lg">Strengths</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {strengths.map((s, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/20"
              >
                <p className="font-medium text-sm">{s.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.detail}</p>
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 uppercase">
                  {s.category}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weaknesses */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            <CardTitle className="text-lg">Weaknesses</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weaknesses.map((w, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20"
              >
                <p className="font-medium text-sm">{w.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{w.detail}</p>
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 uppercase">
                  {w.category}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-lg">Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-lg border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{rec.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {rec.description}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${
                        rec.priority === "high"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : rec.priority === "medium"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                </div>
                {rec.steps.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-muted space-y-1.5">
                    {rec.steps.map((step, j) => (
                      <p key={j} className="text-sm text-muted-foreground">
                        {j + 1}. {step}
                      </p>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                    Impact: {rec.impact}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                    Effort: {rec.effort}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                    {rec.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================
// Main Page
// =============================================

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = use(params);
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("ws") || "";
  const router = useRouter();
  const retryReport = useRetryReport();

  const { data: report, isLoading, error } = useReport(reportId, workspaceId);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-49px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-[calc(100vh-49px)] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="font-medium">Report not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error?.message ||
                "This report doesn't exist or you don't have access."}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/index/seo-score")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to SEO Score
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isInProgress =
    report.status === "PENDING" ||
    report.status === "FETCHING" ||
    report.status === "ANALYZING";

  const verification = report.verification as Verification | null;
  const competitors = report.competitors as Competitors | null;

  return (
    <div className="min-h-[calc(100vh-49px)] bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/index/seo-score")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {report.status === "FAILED" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => retryReport.mutate({ reportId, workspaceId })}
                disabled={retryReport.isPending}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${retryReport.isPending ? "animate-spin" : ""}`}
                />
                Retry
              </Button>
            )}
          </div>

          {/* Title + Status */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-b from-white/90 via-amber-50/30 to-teal-50/50 dark:from-gray-900/90 dark:via-amber-950/10 dark:to-teal-950/20">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-400 via-amber-400 to-teal-400 opacity-80" />
            <CardHeader className="text-center pt-8 pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Waves className="w-5 h-5 text-teal-500" />
                <CardTitle className="text-xl">
                  {report.workspace?.name || "SEO Report"}
                </CardTitle>
              </div>
              {report.workspace?.city && report.workspace?.state && (
                <CardDescription>
                  {report.workspace.city}, {report.workspace.state}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pb-8">
              <StatusStepper status={report.status} />

              {report.status === "FAILED" && report.error && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 max-w-md mx-auto">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {report.error}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* In-Progress State */}
          {isInProgress && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-teal-500 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {report.status === "PENDING" && "Waiting to start..."}
                {report.status === "FETCHING" &&
                  "Fetching business data and reviews..."}
                {report.status === "ANALYZING" &&
                  "AI is analyzing your data..."}
              </p>
            </div>
          )}

          {/* Completed Report */}
          {report.status === "COMPLETED" && (
            <div className="space-y-6">
              {/* Verification */}
              {verification && (
                <VerificationBanner verification={verification} />
              )}

              {/* Score Rings */}
              <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
                <ScoreRing
                  score={report.visibilityScore ?? 0}
                  label="Visibility"
                  color="amber"
                />
                <ScoreRing
                  score={report.reputationScore ?? 0}
                  label="Reputation"
                  color="teal"
                />
              </div>

              {/* Breakdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.visibilityBreakdown && (
                  <VisibilityBreakdownCard
                    breakdown={
                      report.visibilityBreakdown as VisibilityBreakdown
                    }
                  />
                )}
                {report.reputationBreakdown && (
                  <ReputationBreakdownCard
                    breakdown={
                      report.reputationBreakdown as ReputationBreakdown
                    }
                  />
                )}
              </div>

              {/* Competitors */}
              {competitors && competitors.results.length > 0 && (
                <CompetitorsCard competitors={competitors} />
              )}

              {/* Insights */}
              {report.strengths &&
                report.weaknesses &&
                report.recommendations && (
                  <InsightsSection
                    strengths={report.strengths as unknown as Strength[]}
                    weaknesses={report.weaknesses as unknown as Weakness[]}
                    recommendations={
                      report.recommendations as unknown as Recommendation[]
                    }
                  />
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
