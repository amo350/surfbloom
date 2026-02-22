import { Resend } from "resend";

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === "production") {
  throw new Error("RESEND_API_KEY is required in production");
}

export const resend = new Resend(
  process.env.RESEND_API_KEY || "re_dev_placeholder",
);
