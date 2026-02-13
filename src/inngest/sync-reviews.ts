import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { getWorkspaceData } from "@/lib/workspace-data";

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
    await step.run("sync-data", async () => {
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

    return { workspaceId, success: true };
  },
);
