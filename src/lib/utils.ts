import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const INVITE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const INVITE_CHARS_LEN = INVITE_CHARS.length;
// Reject bytes >= threshold so (byte % INVITE_CHARS_LEN) is unbiased
const INVITE_BYTE_THRESHOLD = 256 - (256 % INVITE_CHARS_LEN);

export function generateInviteCode(length: number = 7): string {
  const buffer = new Uint8Array(1);
  let result = "";
  for (let i = 0; i < length; i++) {
    let b: number;
    do {
      globalThis.crypto.getRandomValues(buffer);
      b = buffer[0];
    } while (b >= INVITE_BYTE_THRESHOLD);
    result += INVITE_CHARS[b % INVITE_CHARS_LEN];
  }
  return result;
}
