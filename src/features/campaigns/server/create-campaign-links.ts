import { prisma } from "@/lib/prisma";
import { extractUrls, generateShortCode } from "../lib/link-utils";

export async function createCampaignLinks(
  campaignId: string,
  messageTemplate: string,
  variantB?: string | null,
): Promise<Map<string, string>> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const isLocal = /localhost|127\.0\.0\.1/i.test(appUrl);

  // Don't create short links in local dev
  if (isLocal) return new Map();

  // Extract all URLs from both variants
  const allUrls = new Set<string>();
  for (const url of extractUrls(messageTemplate)) {
    allUrls.add(url);
  }
  if (variantB) {
    for (const url of extractUrls(variantB)) {
      allUrls.add(url);
    }
  }

  if (allUrls.size === 0) return new Map();

  // Check for existing links (resume case)
  const existing = await prisma.campaignLink.findMany({
    where: { campaignId },
    select: { originalUrl: true, shortCode: true },
  });

  const existingMap = new Map(
    existing.map((l) => [l.originalUrl, l.shortCode]),
  );

  const replacements = new Map<string, string>();

  for (const url of allUrls) {
    let shortCode = existingMap.get(url);

    if (!shortCode) {
      shortCode = generateShortCode();
      await prisma.campaignLink.create({
        data: {
          campaignId,
          originalUrl: url,
          shortCode,
        },
      });
    }

    replacements.set(url, `${appUrl}/l/${shortCode}`);
  }

  return replacements;
}
