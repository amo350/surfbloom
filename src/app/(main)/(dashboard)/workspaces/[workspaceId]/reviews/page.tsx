import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { HydrateClient } from "@/trpc/server";
import {
  prefetchReviewStats,
  prefetchReviews,
} from "@/features/reviews/server/prefetch";
import { ReviewsLoading } from "@/features/reviews/components/reviews";
import { ReviewsWithTaskModal } from "@/features/reviews/components/ReviewsWithTaskModal";

type Props = {
  params: Promise<{ workspaceId: string }>;
};

const ReviewsPage = async ({ params }: Props) => {
  const session = await requireAuth();
  const { workspaceId } = await params;

  const membership = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId,
      },
    },
  });

  if (!membership) {
    redirect("/index/locations");
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { googlePlaceId: true, scrapedPlaceData: true },
  });

  if (!workspace) {
    redirect("/index/locations");
  }

  prefetchReviewStats(workspaceId);
  prefetchReviews({
    workspaceId,
    page: 1,
    pageSize: 12,
    sortBy: "newest",
  });

  return (
    <HydrateClient>
      <Suspense fallback={<ReviewsLoading />}>
        <ReviewsWithTaskModal
          workspaceId={workspaceId}
          workspace={workspace}
        />
      </Suspense>
    </HydrateClient>
  );
};

export default ReviewsPage;
