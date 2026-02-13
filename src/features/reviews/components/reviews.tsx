"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  RefreshCw,
  Star,
  Loader2,
  Filter,
  PlusIcon,
  ChevronUp,
  MessageCircle,
  TrendingUp,
  BarChart3,
  Waves,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  SearchIcon,
  ListPlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { AppHeader } from "@/components/AppHeader";
import { LoadingView } from "@/components/EntityComponents";
import { ErrorView } from "@/components/EntityComponents";
import { useSidebar } from "@/components/ui/sidebar";
import {
  useSuspenseReviews,
  useReviewStats,
  useReviewsParams,
  useSyncReviews,
} from "../hooks/use-reviews";
import { getGoogleReviewsLink } from "../utils";
import { useTRPC } from "@/trpc/client";
import { useGetTaskColumns } from "@/features/tasks/hooks/use-task-columns";
import { useTaskModal } from "@/features/tasks/hooks/use-task-modal";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";

type WorkspaceProps = { workspaceId: string };

// ─── Google Icon ──────────────────────────────────────────────

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Page Header ──────────────────────────────────────────────

export const ReviewsPageHeader = ({
  workspaceId,
  onOpenTaskModal,
  showFilters,
  onToggleFilters,
}: WorkspaceProps & {
  onOpenTaskModal?: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}) => {
  const syncReviews = useSyncReviews();

  return (
    <div className="sticky top-0 z-40">
      <AppHeader>
        <div className="flex items-center gap-2">
          {onOpenTaskModal && (
            <Button size="sm" onClick={onOpenTaskModal}>
              <PlusIcon className="size-4" />
              New Task
            </Button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleFilters}
          >
            <Filter className="size-4" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              syncReviews.mutate({ workspaceId, forceRefresh: true })
            }
            disabled={syncReviews.isPending}
          >
            {syncReviews.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync
          </Button>
        </div>
      </AppHeader>

      {showFilters && <ReviewsFilters />}
    </div>
  );
};

// ─── Filters Sub-header ───────────────────────────────────────

export const ReviewsFilters = () => {
  const [params, setParams] = useReviewsParams();

  const hasActiveFilters =
    params.rating != null ||
    params.response !== "all" ||
    params.sort !== "newest";

  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b bg-background/80 backdrop-blur-sm">
      <Filter className="h-4 w-4 text-muted-foreground" />

      <Select
        value={params.response}
        onValueChange={(v) =>
          setParams({
            ...params,
            response: v as "all" | "responded" | "unresponded",
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[160px] h-8 text-sm">
          <SelectValue placeholder="Response status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All reviews</SelectItem>
          <SelectItem value="unresponded">Unresponded</SelectItem>
          <SelectItem value="responded">Responded</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={params.sort}
        onValueChange={(v) =>
          setParams({
            ...params,
            sort: v as "newest" | "oldest" | "lowest" | "highest",
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[150px] h-8 text-sm">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="lowest">Lowest rated</SelectItem>
          <SelectItem value="highest">Highest rated</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={params.rating != null ? String(params.rating) : "all"}
        onValueChange={(v) =>
          setParams({
            ...params,
            rating: v === "all" ? null : Number(v),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[150px] h-8 text-sm">
          <SelectValue placeholder="All ratings" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All ratings</SelectItem>
          <SelectItem value="5">5 stars</SelectItem>
          <SelectItem value="4">4 stars</SelectItem>
          <SelectItem value="3">3 stars</SelectItem>
          <SelectItem value="2">2 stars</SelectItem>
          <SelectItem value="1">1 star</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setParams({
              ...params,
              rating: null,
              response: "all",
              sort: "newest",
              page: 1,
            })
          }
        >
          Clear filters
        </Button>
      )}
    </div>
  );
};

// ─── Stats Row ────────────────────────────────────────────────

export const ReviewsStats = ({ workspaceId }: WorkspaceProps) => {
  const { data } = useReviewStats(workspaceId);

  const responseRate =
    data.total > 0
      ? Math.round(((data.total - data.unresponded) / data.total) * 100)
      : 0;

  return (
    <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-b from-white/90 via-amber-50/30 to-teal-50/40 dark:from-gray-900/90 dark:via-amber-950/10 dark:to-teal-950/20 backdrop-blur-sm">
      {/* Top accent bar */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-400 via-amber-400 to-teal-400 opacity-80" />

      {/* Subtle wave decoration */}
      <div className="absolute inset-x-0 bottom-0 h-20 opacity-[0.03] pointer-events-none">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,40 C200,80 400,10 600,50 C800,90 1000,20 1200,60 L1200,120 L0,120 Z"
            fill="currentColor"
            className="text-teal-500"
          />
        </svg>
      </div>

      <CardHeader className="pb-2 pt-6 relative">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-lg">Review Insights</CardTitle>
            <CardDescription className="text-xs">
              Your reputation at a glance
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative pb-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox
            label="Total Reviews"
            value={data.total.toString()}
            icon="🏖️"
          />
          <StatBox
            label="Average Rating"
            value={data.averageRating ? `${data.averageRating}` : "—"}
            icon="⭐"
            suffix={data.averageRating ? "★" : undefined}
          />
          <StatBox
            label="Needs Response"
            value={data.unresponded.toString()}
            icon="💬"
            alert={data.unresponded > 0}
          />
          <StatBox label="Response Rate" value={`${responseRate}%`} icon="🤙" />
        </div>
      </CardContent>
    </Card>
  );
};

function StatBox({
  label,
  value,
  icon,
  suffix,
  alert,
}: {
  label: string;
  value: string;
  icon: string;
  suffix?: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm px-4 py-3 transition-all hover:shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className="text-base">{icon}</span>
      </div>
      <p
        className={`mt-1 text-2xl font-bold tracking-tight ${
          alert ? "text-amber-600 dark:text-amber-400" : "text-foreground"
        }`}
      >
        {value}
        {suffix && (
          <span className="ml-0.5 text-lg font-medium text-amber-500">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}

// ─── Rating Distribution Bar ──────────────────────────────────

export const RatingDistribution = ({ workspaceId }: WorkspaceProps) => {
  const { data } = useReviewStats(workspaceId);
  const [params, setParams] = useReviewsParams();

  const icons: Record<number, string> = {
    5: "🏄",
    4: "🌊",
    3: "🐚",
    2: "🌺",
    1: "🥥",
  };

  return (
    <div className="grid grid-cols-5 gap-3">
      {[5, 4, 3, 2, 1].map((rating) => {
        const isActive = params.rating === rating;

        return (
          <button
            key={rating}
            type="button"
            onClick={() =>
              setParams({ rating: isActive ? null : rating, page: 1 })
            }
            className={`group relative rounded-2xl px-3 py-4 transition-all duration-200 flex flex-col items-center gap-2 ${
              isActive
                ? "bg-gradient-to-b from-amber-50 via-orange-50/40 to-amber-100/50 dark:from-amber-950/30 dark:via-orange-950/10 dark:to-amber-900/20 shadow-md shadow-amber-400/15 ring-1 ring-amber-300/60 dark:ring-amber-700/40 scale-[1.03]"
                : "bg-gradient-to-b from-stone-50/80 to-amber-50/30 dark:from-stone-900/30 dark:to-amber-950/10 shadow-sm ring-1 ring-stone-200/60 dark:ring-stone-800/40 hover:shadow-md hover:ring-amber-200/60 dark:hover:ring-amber-800/30 hover:scale-[1.02]"
            }`}
          >
            {/* Sand texture dot pattern */}
            <div className="absolute inset-0 rounded-2xl opacity-[0.04] pointer-events-none bg-[radial-gradient(circle_at_1px_1px,_currentColor_1px,_transparent_0)] bg-[length:8px_8px] text-amber-800" />

            <span
              className={`text-2xl transition-transform duration-200 ${isActive ? "scale-110 drop-shadow-md" : "group-hover:scale-105 drop-shadow-sm"}`}
            >
              {icons[rating]}
            </span>

            <div className="flex items-center gap-0.5">
              {Array.from({ length: rating }, (_, i) => (
                <Star
                  key={i}
                  className={`h-2.5 w-2.5 transition-colors ${
                    isActive
                      ? "fill-amber-400 text-amber-400"
                      : "fill-amber-300/70 text-amber-300/70 group-hover:fill-amber-400 group-hover:text-amber-400"
                  }`}
                />
              ))}
              {Array.from({ length: 5 - rating }, (_, i) => (
                <Star
                  key={`empty-${i}`}
                  className="h-2.5 w-2.5 fill-stone-200/60 text-stone-200/60 dark:fill-stone-700/40 dark:text-stone-700/40"
                />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ─── Review Task Action (avatar → hover + → dropdown) ──────────────

function ReviewTaskAction({
  review,
  workspaceId,
  icon,
}: {
  review: {
    id: string;
    rating: number;
    text: string | null;
    authorName: string | null;
  };
  workspaceId: string;
  icon: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const trpc = useTRPC();
  const taskModal = useTaskModal();
  const { data: columns } = useGetTaskColumns(workspaceId);
  const defaultColumn =
    columns?.find((col) => col.position === 3) ?? columns?.[0];

  const { data: searchResults } = useQuery({
    ...trpc.tasks.getMany.queryOptions({
      workspaceId,
      search: search || undefined,
    }),
    enabled: searchOpen && search.length > 0,
  });

  const createTask = useMutation(
    trpc.tasks.create.mutationOptions({
      onSuccess: (data) => {
        setMenuOpen(false);
        taskModal.open(data.id);
      },
    }),
  );

  const updateTask = useUpdateTask();

  const handleCreateNew = () => {
    if (!defaultColumn) return;
    const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

    createTask.mutate({
      workspaceId,
      columnId: defaultColumn.id,
      name: `Review follow-up (${stars})`,
      description: review.text
        ? `**${review.rating}/5 stars**\n\n"${review.text}"\n\n---\n_Task created from review_`
        : `**${review.rating}/5 stars**\n\n_No review text provided_\n\n---\n_Task created from review_`,
      reviewId: review.id,
    });
  };

  const handleLinkExisting = (taskId: string) => {
    updateTask.mutate({
      id: taskId,
      workspaceId,
      reviewId: review.id,
    });
    setSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-50 to-teal-50 dark:from-amber-950/20 dark:to-teal-950/20 text-xl ring-1 ring-border/50 transition-all duration-200 hover:ring-teal-300 dark:hover:ring-teal-700 hover:shadow-sm"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isHovered ? (
            <PlusIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          ) : (
            icon
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-0" align="start">
        {!searchOpen ? (
          <div className="py-1">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
              onClick={handleCreateNew}
              disabled={createTask.isPending || !defaultColumn}
            >
              {createTask.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ListPlusIcon className="h-4 w-4 text-muted-foreground" />
              )}
              Create new task
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
              Add to existing task
            </button>
          </div>
        ) : (
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by # or name..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {search.length === 0
                  ? "Type to search tasks"
                  : "No tasks found"}
              </CommandEmpty>
              {searchResults?.map((task: { id: string; name: string; taskNumber: number; column?: { color: string } | null }) => (
                <CommandItem
                  key={task.id}
                  onSelect={() => handleLinkExisting(task.id)}
                  className="flex items-center gap-2"
                >
                  <div
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: task.column?.color ?? "#6B7280" }}
                  />
                  <span className="text-xs font-mono text-muted-foreground">
                    #{task.taskNumber}
                  </span>
                  <span className="text-sm truncate">{task.name}</span>
                </CommandItem>
              ))}
            </CommandList>
            <div className="border-t p-1">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/60 rounded-sm"
                onClick={() => {
                  setSearchOpen(false);
                  setSearch("");
                }}
              >
                ← Back
              </button>
            </div>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Create Task From Review ────────────────────────────────────

function CreateTaskFromReview({
  review,
  workspaceId,
}: {
  review: {
    id: string;
    rating: number;
    text: string | null;
    authorName: string | null;
  };
  workspaceId: string;
}) {
  const trpc = useTRPC();
  const router = useRouter();
  const { data: columns } = useGetTaskColumns(workspaceId);

  const defaultColumn =
    columns?.find((col) => col.position === 3) ?? columns?.[0];

  const createTask = useMutation(
    trpc.tasks.create.mutationOptions({
      onSuccess: (data) => {
        router.push(`/workspaces/${workspaceId}/tasks/${data.id}`);
      },
    }),
  );

  const handleCreate = () => {
    if (!defaultColumn) return;
    const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
    const author = review.authorName || "Anonymous";
    createTask.mutate({
      workspaceId,
      columnId: defaultColumn.id,
      name: `Review follow-up: ${author} (${stars})`,
      description: `**Review from ${author}** — ${review.rating}/5\n\n"${review.text || "No text provided"}"\n\n---\n_Task created from review_`,
      reviewId: review.id,
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs gap-1.5 text-muted-foreground hover:bg-muted/60 px-2"
      onClick={handleCreate}
      disabled={createTask.isPending || !defaultColumn}
    >
      {createTask.isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <PlusIcon className="h-3 w-3" />
      )}
      Create Task
    </Button>
  );
}

// ─── Review Response Area ──────────────────────────────────────

function ReviewResponseArea({
  review,
  workspaceId,
  googleReviewsLink,
}: {
  review: { id: string; rating: number; text: string | null };
  workspaceId: string;
  googleReviewsLink?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const trpc = useTRPC();
  const generate = useMutation(
    trpc.reviews.generateResponse.mutationOptions({
      onSuccess: (data) => setDraft(data.text),
    }),
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs gap-1.5 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/20 px-2"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-3 w-3" />
        Write response
      </Button>
    );
  }

  return (
    <div className="mt-3 space-y-2.5 rounded-xl border border-border/50 bg-muted/20 dark:bg-muted/10 p-3">
      <Textarea
        placeholder="Write your response or generate one with AI..."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        className="resize-none text-sm bg-background/80 border-border/50 rounded-lg focus-visible:ring-teal-500/30"
      />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5 rounded-lg"
          onClick={() =>
            generate.mutate({
              reviewId: review.id,
              workspaceId,
            })
          }
          disabled={generate.isPending}
        >
          {generate.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          {generate.isPending ? "Generating..." : "Generate with AI"}
        </Button>

        {draft && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 rounded-lg"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3 text-teal-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
        )}

        {draft && googleReviewsLink && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 rounded-lg"
            asChild
          >
            <a
              href={googleReviewsLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GoogleIcon className="h-3 w-3" />
              Respond on Google
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs ml-auto text-muted-foreground"
          onClick={() => {
            setIsOpen(false);
            setDraft("");
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Review List ──────────────────────────────────────────────

export const ReviewsList = ({
  workspaceId,
  googleReviewsLink,
}: WorkspaceProps & { googleReviewsLink?: string | null }) => {
  const { data } = useSuspenseReviews(workspaceId);

  if (data.items.length === 0) {
    return (
      <Card className="border border-dashed border-border/50 bg-muted/20">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No reviews match your filters
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Try adjusting your filters or sync for new reviews
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2.5">
      {data.items.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          workspaceId={workspaceId}
          googleReviewsLink={googleReviewsLink}
        />
      ))}
    </div>
  );
};

// ─── Review Item ──────────────────────────────────────────────

function ReviewItem({
  review,
  workspaceId,
  googleReviewsLink,
}: {
  review: {
    id: string;
    authorName: string | null;
    authorImageUrl: string | null;
    rating: number;
    text: string | null;
    publishedAt: Date | null;
    ownerResponse: string | null;
    ownerRespondedAt: Date | null;
    source: string | null;
  };
  workspaceId: string;
  googleReviewsLink?: string | null;
}) {
  const icons: Record<number, string> = {
    5: "🏄",
    4: "🌊",
    3: "🐚",
    2: "🌺",
    1: "🥥",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-card/90 via-card/80 to-teal-50/30 dark:to-teal-950/15 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
      {/* Subtle wave decoration */}
      <div className="absolute inset-y-0 right-0 w-48 opacity-[0.05] group-hover:opacity-[0.08] pointer-events-none transition-opacity duration-500">
        <svg
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M120,0 C140,40 100,60 120,100 C140,140 100,160 120,200 L200,200 L200,0 Z"
            fill="currentColor"
            className="text-teal-500"
          />
          <path
            d="M150,0 C170,50 130,70 150,120 C170,170 130,190 160,200 L200,200 L200,0 Z"
            fill="currentColor"
            className="text-amber-500"
          />
        </svg>
      </div>

      <div className="relative p-4">
        <div className="flex items-start gap-3.5">
          <ReviewTaskAction
            review={review}
            workspaceId={workspaceId}
            icon={icons[review.rating] ?? "🐚"}
          />

          <div className="flex-1 min-w-0 space-y-2">
            {/* Top row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <RatingStars rating={review.rating} />
                {review.source === "google" && (
                  <div className="flex items-center gap-1 rounded-full bg-muted/40 px-2 py-0.5 ring-1 ring-border/40">
                    <GoogleIcon className="h-3 w-3" />
                    <span className="text-[10px] font-medium text-muted-foreground">
                      Google
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {review.ownerResponse ? (
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-teal-100/80 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-0 font-medium"
                  >
                    Replied
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-amber-300/60 dark:border-amber-700/40 text-amber-600 dark:text-amber-400 font-medium"
                  >
                    Needs reply
                  </Badge>
                )}
                {review.publishedAt && (
                  <span className="text-[11px] text-muted-foreground/70">
                    {formatDistanceToNow(new Date(review.publishedAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Review text */}
            {review.text && (
              <p className="text-sm leading-relaxed text-foreground/80">
                {review.text}
              </p>
            )}

            {/* Actions row */}
            <div className="flex items-center gap-1.5 pt-1">
              {!review.ownerResponse && (
                <ReviewResponseArea
                  review={review}
                  workspaceId={workspaceId}
                  googleReviewsLink={googleReviewsLink}
                />
              )}
            </div>

            {/* Owner response */}
            {review.ownerResponse && (
              <div className="mt-2 rounded-lg bg-muted/30 dark:bg-muted/10 border border-border/50 p-3">
                <p className="text-[11px] font-medium text-teal-700 dark:text-teal-400 mb-1">
                  Owner response
                  {review.ownerRespondedAt && (
                    <span className="font-normal text-muted-foreground/60">
                      {" · "}
                      {formatDistanceToNow(new Date(review.ownerRespondedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </p>
                <p className="text-sm text-foreground/70">
                  {review.ownerResponse}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rating Stars ─────────────────────────────────────────────

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────

export const ReviewsPagination = ({ workspaceId }: WorkspaceProps) => {
  const { data, isFetching } = useSuspenseReviews(workspaceId);
  const [params, setParams] = useReviewsParams();

  if (data.totalPages <= 1) return null;

  return (
    <NumberedPagination
      page={data.page}
      totalPages={data.totalPages}
      disabled={isFetching}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

function NumberedPagination({
  page,
  totalPages,
  disabled,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (page > 3) pages.push("ellipsis");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1 || disabled}
        onClick={() => onPageChange(page - 1)}
        className="rounded-xl text-xs"
      >
        Prev
      </Button>

      {getPageNumbers().map((item, idx) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-1.5 text-sm text-muted-foreground/50"
          >
            ···
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? "default" : "ghost"}
            size="sm"
            disabled={disabled}
            className={`min-w-[34px] rounded-xl text-xs ${
              item === page
                ? "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-sm shadow-teal-500/20 border-0"
                : "hover:bg-muted/60"
            }`}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages || disabled}
        onClick={() => onPageChange(page + 1)}
        className="rounded-xl text-xs"
      >
        Next
      </Button>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────

export const ReviewsEmpty = ({ workspaceId }: WorkspaceProps) => {
  const syncReviews = useSyncReviews();

  return (
    <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-amber-50 dark:from-teal-950/30 dark:to-amber-950/20 text-4xl shadow-sm ring-1 ring-teal-100/50 dark:ring-teal-800/30">
          🏄
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            No reviews yet
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Pull in your Google reviews to start monitoring and responding to
            customer feedback.
          </p>
        </div>
        <Button
          onClick={() => syncReviews.mutate({ workspaceId })}
          disabled={syncReviews.isPending}
          size="lg"
          className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 border-0 shadow-lg hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300 rounded-xl px-8"
        >
          {syncReviews.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Reviews
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// ─── Content Wrapper ──────────────────────────────────────────

export const ReviewsContent = ({
  workspaceId,
  workspace,
  onOpenTaskModal,
}: WorkspaceProps & {
  workspace: { googlePlaceId?: string | null; scrapedPlaceData?: unknown };
  onOpenTaskModal?: () => void;
}) => {
  const { data: statsData } = useReviewStats(workspaceId);
  const [showFilters, setShowFilters] = useState(false);

  const googleReviewsLink = getGoogleReviewsLink(workspace);

  if (statsData.total === 0) {
    return <ReviewsEmpty workspaceId={workspaceId} />;
  }

  return (
    <>
      <ReviewsPageHeader
        workspaceId={workspaceId}
        onOpenTaskModal={onOpenTaskModal}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
      />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-4">
        <RatingDistribution workspaceId={workspaceId} />
        <ReviewsStats workspaceId={workspaceId} />
        <ReviewsList
          workspaceId={workspaceId}
          googleReviewsLink={googleReviewsLink}
        />
        <ReviewsPagination workspaceId={workspaceId} />
      </div>

      <ScrollToTop />
    </>
  );
};

// ─── Scroll to top ───────────────────────────────────────────

function ScrollToTop() {
  const [show, setShow] = useState(false);
  const { state, isMobile } = useSidebar();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  // Stay on page side: offset by sidebar width (expanded 16rem, collapsed 3rem); mobile = overlay so just left-6
  const leftClass = isMobile
    ? "left-6"
    : state === "expanded"
      ? "left-[17.5rem]"
      : "left-[4.5rem]";

  return (
    <Button
      size="icon"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 z-50 h-10 w-10 rounded-full bg-teal-500/20 hover:bg-gradient-to-r hover:from-teal-500 hover:to-teal-600 text-teal-600/70 hover:text-white shadow-sm shadow-black/5 hover:shadow-lg hover:shadow-teal-500/25 border border-teal-400/20 hover:border-teal-500/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${leftClass}`}
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  );
}

// ─── Loading & Error ──────────────────────────────────────────

export const ReviewsLoading = () => {
  return <LoadingView message="Loading reviews..." />;
};

export const ReviewsError = () => {
  return <ErrorView message="Error loading reviews..." />;
};
