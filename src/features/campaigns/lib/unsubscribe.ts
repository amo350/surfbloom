import { createHmac } from "crypto";

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("UNSUBSCRIBE_SECRET is required in production");
    }
    // Dev-only fallback
    return "surfbloom-dev-unsub-secret";
  }
  return secret;
}

// Generate a signed token: contactId.signature
export function generateUnsubscribeToken(contactId: string): string {
  const sig = createHmac("sha256", getSecret())
    .update(contactId)
    .digest("hex")
    .slice(0, 12);
  return `${contactId}.${sig}`;
}

// Verify and extract contactId from token
export function verifyUnsubscribeToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [contactId, sig] = parts;
  const expected = createHmac("sha256", getSecret())
    .update(contactId)
    .digest("hex")
    .slice(0, 12);

  if (sig !== expected) return null;
  return contactId;
}
