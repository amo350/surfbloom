// src/app/layout.tsx
import type { Metadata } from "next";
import { validateV4Environment } from "@/lib/env-check";

validateV4Environment();

export const metadata: Metadata = {
  title: "SurfBloom",
  description: "Business management platform",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
