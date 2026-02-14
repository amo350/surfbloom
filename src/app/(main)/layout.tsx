// src/app/(main)/layout.tsx
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import { Provider } from "jotai";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SurfBloom",
  description: "Business management platform",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${inter.variable} ${geistMono.variable} antialiased font-sans`}
    >
      <TRPCReactProvider>
        <NuqsAdapter>
          <Provider>
            {children}
            <Toaster />
          </Provider>
        </NuqsAdapter>
      </TRPCReactProvider>
    </div>
  );
}
