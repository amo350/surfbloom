import { createId } from "@paralleldrive/cuid2";

// Generate a short 8-char code
export function generateShortCode(): string {
  return createId().slice(0, 8);
}

// Extract URLs from message text
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX);
  if (!matches) return [];
  // Deduplicate
  return [...new Set(matches)];
}

export function replaceUrls(
  text: string,
  replacements: Map<string, string>,
): string {
  let result = text;
  for (const [original, shortened] of replacements) {
    result = result.replaceAll(original, shortened);
  }
  return result;
}
