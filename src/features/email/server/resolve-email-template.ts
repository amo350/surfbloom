const TOKEN_MAP: Record<string, (contact: any, workspace: any) => string> = {
  first_name: (c) => c.firstName || "there",
  last_name: (c) => c.lastName || "",
  full_name: (c) =>
    [c.firstName, c.lastName].filter(Boolean).join(" ") || "there",
  email: (c) => c.email || "",
  location_name: (_c, w) => w.name || "our business",
  location_phone: (_c, w) => w.phone || "",
};

/**
 * Resolve {tokens} in email subject and HTML body.
 */
export function resolveEmailTemplate(
  subject: string,
  htmlBody: string,
  contact: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  },
  workspace: {
    name: string;
    phone?: string | null;
  },
): { subject: string; html: string } {
  const resolve = (text: string): string => {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      const resolver = TOKEN_MAP[key];
      return resolver ? resolver(contact, workspace) : match;
    });
  };

  return {
    subject: resolve(subject),
    html: resolve(htmlBody),
  };
}
