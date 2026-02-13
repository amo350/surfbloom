export function getGoogleReviewsLink(workspace: {
  googlePlaceId?: string | null;
  scrapedPlaceData?: unknown;
}): string | null {
  // Try Outscraper's reviews_link first
  const placeData = workspace.scrapedPlaceData as Record<string, unknown> | null;
  if (placeData?.reviews_link && typeof placeData.reviews_link === "string") {
    return placeData.reviews_link;
  }

  // Fallback: construct from placeId
  if (workspace.googlePlaceId) {
    return `https://search.google.com/local/reviews?placeid=${workspace.googlePlaceId}`;
  }

  return null;
}
