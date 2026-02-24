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

    const newReviewsWithContact = await step.run(
      "resolve-review-contacts",
      async () => {
        const results: Array<
          (typeof newReviews)[number] & {
            contactId: string | null;
            contact: {
              id: string;
              firstName: string | null;
              lastName: string | null;
              email: string | null;
              phone: string | null;
              stage: string;
              source: string;
            } | null;
          }
        > = [];

        for (const review of newReviews) {
          const parsedName = parseAuthorName(review.authorName);
          if (!parsedName?.firstName) {
            results.push({
              ...review,
              contactId: null,
              contact: null,
            });
            continue;
          }

          const contact = await findOrCreateReviewContact({
            workspaceId,
            firstName: parsedName.firstName,
            lastName: parsedName.lastName,
          });

          results.push({
            ...review,
            contactId: contact.id,
            contact: {
              id: contact.id,
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              phone: contact.phone,
              stage: contact.stage,
              source: contact.source,
            },
          });
        }

        return results;
      },
    );

    await step.run("dispatch-review-triggers", async () => {
      for (const review of newReviewsWithContact) {
        await fireWorkflowTrigger({
          triggerType: "REVIEW_RECEIVED",
          payload: {
            workspaceId,
            reviewId: review.id,
            rating: review.rating,
            text: review.text,
            authorName: review.authorName,
            contactId: review.contactId || undefined,
            contact: review.contact || undefined,
          },
        }).catch((err) => {
          console.error(
            `[sync-reviews] Failed trigger dispatch for workspace ${workspaceId}, review ${review.id} (${review.authorName || "unknown"}):`,
            err,
          );
        });
      }
    });

    return {
      workspaceId,
      success: true,
      fromCache: false,
      triggeredReviews: newReviews.length,
    };
  },
);

type ParsedName = {
  firstName: string;
  lastName: string | null;
};

function parseAuthorName(authorName: string | null): ParsedName | null {
  const normalized = authorName?.replace(/\s+/g, " ").trim();
  if (!normalized) return null;

  const parts = normalized.split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;

  if (!firstName) return null;
  return { firstName, lastName };
}

async function findOrCreateReviewContact({
  workspaceId,
  firstName,
  lastName,
}: {
  workspaceId: string;
  firstName: string;
  lastName: string | null;
}) {
  const exactMatch = await prisma.chatContact.findFirst({
    where: {
      workspaceId,
      isContact: true,
      firstName: { equals: firstName, mode: "insensitive" },
      ...(lastName
        ? {
            lastName: { equals: lastName, mode: "insensitive" },
          }
        : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      stage: true,
      source: true,
    },
  });

  if (exactMatch) return exactMatch;

  const softMatch = await prisma.chatContact.findFirst({
    where: {
      workspaceId,
      isContact: true,
      firstName: { contains: firstName, mode: "insensitive" },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      stage: true,
      source: true,
    },
  });

  if (softMatch) return softMatch;

  return prisma.chatContact.create({
    data: {
      workspaceId,
      firstName,
      lastName,
      source: "review_campaign",
      stage: "new_lead",
      isContact: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      stage: true,
      source: true,
    },
  });
}
