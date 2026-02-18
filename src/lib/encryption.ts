import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = process.env.ENCRYPTION_KEY; // 32-byte hex string

function getKey(): Buffer {
  if (!KEY || KEY.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string (32 bytes). Generate with: openssl rand -hex 32",
    );
  }
  return Buffer.from(KEY, "hex");
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  // Store as iv:authTag:ciphertext
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(stored: string): string {
  const [ivHex, authTagHex, ciphertext] = stored.split(":");
  if (!ivHex || !authTagHex || !ciphertext) {
    throw new Error("Invalid encrypted value format");
  }
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
