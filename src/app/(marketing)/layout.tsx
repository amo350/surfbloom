import type { ReactNode } from "react";
import type { Metadata } from "next";
import {
  Great_Vibes,
  Montserrat,
  Playfair_Display,
  Roboto_Mono,
} from "next/font/google";
import Navbar from "@/components/marketing/components/Navbar";
import "../globals.css";
import Footer from "@/components/marketing/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "SurfBloom",
    template: "%s | SurfBloom",
  },
  description: "Business management platform",
};

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-marketing-montserrat",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-marketing-playfair",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marketing-great-vibes",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-marketing-roboto-mono",
});

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    // We establish the global Sandy Shore background and selection colors here
    // so every marketing page inherits the exact same baseline aesthetic.
    <div
      data-marketing
      className={`flex min-h-screen flex-col bg-[#F9F5E7] text-[#004D40] selection:bg-[#FF6F61] selection:text-white font-montserrat ${montserrat.variable} ${playfairDisplay.variable} ${greatVibes.variable} ${robotoMono.variable}`}
    >
      <Navbar />

      {/* The main content area grows to push the footer down if a page is short */}
      <main className="flex-grow relative z-10">{children}</main>

      <Footer />
    </div>
  );
}
