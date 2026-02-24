import { prisma } from "@/lib/prisma";

export interface BrandProfile {
  tone: string | null;
  industry: string | null;
  services: string | null;
  usps: string | null;
  instructions: string | null;
  locationName: string;
}

/**
 * Load brand profile from workspace.
 * Returns formatted context for AI system prompts.
 */
export async function loadBrandContext(
  workspaceId: string,
): Promise<BrandProfile> {
  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: {
      name: true,
      brandTone: true,
      brandIndustry: true,
      brandServices: true,
      brandUsps: true,
      brandInstructions: true,
    },
  });

  return {
    tone: workspace.brandTone,
    industry: workspace.brandIndustry,
    services: workspace.brandServices,
    usps: workspace.brandUsps,
    instructions: workspace.brandInstructions,
    locationName: workspace.name,
  };
}

/**
 * Format brand profile into a system prompt section.
 * Appended to every AI Node's system prompt automatically.
 */
export function formatBrandPrompt(brand: BrandProfile): string {
  const parts: string[] = [];

  parts.push(`Business: ${brand.locationName}`);

  if (brand.industry) parts.push(`Industry: ${brand.industry}`);
  if (brand.tone) parts.push(`Tone: ${brand.tone}`);
  if (brand.services) parts.push(`Services: ${brand.services}`);
  if (brand.usps) parts.push(`Unique selling points: ${brand.usps}`);
  if (brand.instructions)
    parts.push(`Special instructions: ${brand.instructions}`);

  if (parts.length <= 1) return ""; // No brand profile configured

  return `\n\nBusiness context:\n${parts.join("\n")}`;
}
