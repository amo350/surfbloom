import { prisma } from "@/lib/prisma";
import { extractUrls, generateShortCode } from "@/features/campaigns/lib/link-utils";

export async function createCampaignLinks(
  campaignId: string,
  messageTemplate: string,
  variantB?: string | null,
): Promise<Map<string, string>> {
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  let appUrl: string;

  try {
    const parsed = new URL(rawAppUrl);
    appUrl = parsed.origin;
  } catch {
    console.warn("NEXT_PUBLIC_APP_URL is missing or invalid — skipping link tracking");
    return new Map();
  }

  if (/localhost|127\.0\.0\.1/i.test(appUrl)) return new Map();

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
