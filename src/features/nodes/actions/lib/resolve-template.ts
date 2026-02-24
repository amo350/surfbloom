import Handlebars from "handlebars";
import { resolveCampaignTokens, type ResolverContext } from "./token-map";

// Keep compatibility with templates that use {{json value}}.
if (!Handlebars.helpers.json) {
  Handlebars.registerHelper("json", (value: unknown) => {
    return new Handlebars.SafeString(JSON.stringify(value, null, 2));
  });
}

/**
 * Two-pass template resolution for workflow nodes.
 *
 * Pass 1: {campaign_tokens} -> resolved from contact/workspace data
 * Pass 2: {{handlebars_vars}} -> resolved from full workflow context
 */
export function resolveTemplate(
  template: string,
  context: Record<string, unknown>,
  resolverContext?: ResolverContext,
): string {
  if (!template) return "";

  let result = template;

  // Pass 1: campaign tokens (single braces)
  if (resolverContext) {
    result = resolveCampaignTokens(result, resolverContext);
  } else {
    // Minimal fallback so campaign tokens work with raw workflow context too.
    const minimalContext: ResolverContext = {
      workflow: context,
      contact:
        context.contact && typeof context.contact === "object"
          ? (context.contact as ResolverContext["contact"])
          : null,
      workspace:
        context.workspace && typeof context.workspace === "object"
          ? (context.workspace as ResolverContext["workspace"])
          : null,
    };
    result = resolveCampaignTokens(result, minimalContext);
  }

  // Pass 2: Handlebars (double braces)
  try {
    const compiled = Handlebars.compile(result, { noEscape: true });
    result = compiled(context);
  } catch {
    // If Handlebars parsing fails, keep campaign-token result.
  }

  return result;
}
