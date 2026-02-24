import Handlebars from "handlebars";

/**
 * Resolve a template string against workflow context.
 *
 * V1: Handlebars only ({{contact.firstName}}, {{review.rating}}, etc.)
 * W-9 upgrades this to also resolve {first_name} campaign tokens.
 */
export function resolveTemplate(
  template: string,
  context: Record<string, unknown>,
): string {
  if (!template) return "";

  try {
    const compiled = Handlebars.compile(template, { noEscape: true });
    return compiled(context);
  } catch {
    // If template is malformed, return as-is rather than crashing
    return template;
  }
}
