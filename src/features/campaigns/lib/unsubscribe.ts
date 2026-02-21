import { createHmac } from "crypto";

const SECRET = process.env.UNSUBSCRIBE_SECRET || "surfbloom-unsub-default";

// Generate a signed token: contactId.signature
export function generateUnsubscribeToken(contactId: string): string {
  const sig = createHmac("sha256", SECRET)
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
  const expected = createHmac("sha256", SECRET)
    .update(contactId)
    .digest("hex")
    .slice(0, 12);

  if (sig !== expected) return null;
  return contactId;
}
