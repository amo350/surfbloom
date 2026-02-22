let hasValidated = false;

export function validateV4Environment() {
  if (hasValidated) return [];
  hasValidated = true;

  const warnings: string[] = [];

  if (!process.env.RESEND_API_KEY) {
    warnings.push("RESEND_API_KEY not set - email campaigns will fail");
  }

  if (!process.env.UNSUBSCRIBE_SECRET) {
    warnings.push(
      "UNSUBSCRIBE_SECRET not set - unsubscribe links will fail in production",
    );
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    warnings.push(
      "NEXT_PUBLIC_APP_URL not set - short links and QR codes will not work",
    );
  }

  if (warnings.length > 0) {
    console.warn("V4 environment warnings:");
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  return warnings;
}
