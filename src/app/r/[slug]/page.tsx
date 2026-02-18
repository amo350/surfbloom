// src/app/r/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FeedbackPage } from "./feedback-page";

export const metadata = {
  title: "Share Your Feedback",
};

export default async function FeedbackRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const isPlaceholder = slug === "your-slug";

  const workspace = isPlaceholder
    ? await prisma.workspace.findFirst({
        where: { feedbackSlug: { not: null } },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          googleReviewUrl: true,
          feedbackHeading: true,
          feedbackMessage: true,
          phone: true,
          feedbackSlug: true,
        },
      })
    : await prisma.workspace.findUnique({
        where: { feedbackSlug: slug },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          googleReviewUrl: true,
          feedbackHeading: true,
          feedbackMessage: true,
          phone: true,
          feedbackSlug: true,
        },
      });

  if (!workspace) notFound();

  const effectiveSlug =
    isPlaceholder && workspace.feedbackSlug ? workspace.feedbackSlug : slug;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <FeedbackPage
      workspace={{
        id: workspace.id,
        name: workspace.name,
        imageUrl: workspace.imageUrl,
        googleReviewUrl: workspace.googleReviewUrl,
        feedbackHeading: workspace.feedbackHeading,
        feedbackMessage: workspace.feedbackMessage,
        phone: workspace.phone,
      }}
      slug={effectiveSlug}
    />
    </>
  );
}
