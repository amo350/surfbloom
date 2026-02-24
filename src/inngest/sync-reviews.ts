import { NonRetriableError } from "inngest";
import { fireWorkflowTrigger } from "@/features/nodes/lib/trigger-dispatcher";
import { prisma } from "@/lib/prisma";
import { getWorkspaceData } from "@/lib/workspace-data";
import { inngest } from "./client";

export const syncReviews = inngest.createFunction(
  {
    id: "sync-reviews",
    retries: 2,
    onFailure: async ({ event }: { event: any }) => {
      const workspaceId = event.data.event.data?.workspaceId;
      if (workspaceId) {
        console.error(
          `[sync-reviews] Failed for workspace ${workspaceId}:`,
          event.data.error?.message,
        );
      }
    },
  },
  { event: "workspace/sync.reviews" },
  async ({ event, step }) => {
    const { workspaceId, forceRefresh } = event.data;

    // Snapshot existing reviews so we can fire only for newly inserted ones.
    const existingGoogleReviewIds = await step.run(
      "load-existing-review-ids",
      async () => {
        const existingReviews = await prisma.review.findMany({
          where: { workspaceId },
          select: { googleReviewId: true },
        });
        return existingReviews.map((review) => review.googleReviewId);
      },
    );

    // Build query from workspace data
    const query = await step.run("build-query", async () => {
      const workspace = await prisma.workspace.findUniqueOrThrow({
        where: { id: workspaceId },
        select: {
          name: true,
          address: true,
          city: true,
          state: true,
        },
      });

      if (!workspace.city && !workspace.address) {
        throw new NonRetriableError(
          "Workspace needs an address before syncing reviews. Add one in Settings.",
        );
      }

      const parts = [workspace.name];
      if (workspace.address) parts.push(workspace.address);
      if (workspace.city) parts.push(workspace.city);
      if (workspace.state) parts.push(workspace.state);

      return parts.join(", ");
    });

    // Fetch place data + upsert reviews (same path as report pipeline)
    const syncResult = await step.run("sync-data", async () => {
      const data = await getWorkspaceData(workspaceId, {
        query,
        reviewsLimit: 200,
        forceRefresh,
      });

      console.log(
        `[sync-reviews] ${data.fromCache ? "Cache hit" : "Fresh fetch"} for workspace ${workspaceId}`,
      );

      return {
        fromCache: data.fromCache,
        reviewCount: data.place?.reviews ?? 0,
      };
    });

    if (syncResult.fromCache) {
      return {
        workspaceId,
        success: true,
        fromCache: true,
        triggeredReviews: 0,
      };
    }

    const existingSet = new Set(existingGoogleReviewIds);

    const newReviews = await step.run("find-new-reviews", async () => {
      const candidates = await prisma.review.findMany({
        where: {
          workspaceId,
        },
        select: {
          id: true,
          rating: true,
          text: true,
          authorName: true,
          googleReviewId: true,
        },
      });

      return candidates.filter(
        (review) => !existingSet.has(review.googleReviewId),
      );
    });

    for (const review of newReviews) {
      fireWorkflowTrigger({
        triggerType: "REVIEW_RECEIVED",
        payload: {
          workspaceId,
          reviewId: review.id,
          rating: review.rating,
          text: review.text,
          authorName: review.authorName,
        },
      }).catch(() => {});
    }

    return {
      workspaceId,
      success: true,
      fromCache: false,
      triggeredReviews: newReviews.length,
    };
  },
);
