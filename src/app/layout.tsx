// src/app/layout.tsx
import { validateV4Environment } from "@/lib/env-check";

validateV4Environment();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
