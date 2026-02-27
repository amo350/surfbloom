import Link from "next/link";
import Image from "next/image";
import { Linkedin, X, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-20 -mt-12 overflow-hidden rounded-t-[4rem] bg-[#004D40] px-6 md:px-12 pt-24 pb-8 text-[#F9F5E7] shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
      {/* Background abstract elements */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#00A5D4]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#FF6F61]/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

      {/* MIDDLE SECTION: 4-Column Navigation Grid */}
      <div className="relative z-10 mx-auto max-w-7xl grid grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 border-t border-white/10 pt-16 pb-16">
        {/* Logo Area (Takes up 1 column space on desktop to offset the links) */}
        <div className="col-span-2 lg:col-span-1 mb-8 lg:mb-0">
          <Link
            href="/"
            className="sb-font-playfair flex items-center gap-2 text-3xl font-bold hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.png"
              alt="SurfBloom logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-contain bg-white/10 p-1"
            />
            SurfBloom
          </Link>
          <div className="mt-8 sb-font-roboto-mono inline-flex items-center gap-3 rounded-full bg-black/20 border border-white/5 px-4 py-2 text-xs text-white/80">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#FF6F61] shadow-[0_0_10px_#FF6F61]" />
            Vibes Operational
          </div>
        </div>

        {/* Column 1: Product */}
        <div>
          <h4 className="sb-font-playfair font-bold text-xl text-[#00A5D4] mb-6">
            Product
          </h4>
          <ul className="space-y-4 text-sm font-medium text-[#F9F5E7]/70">
            <li>
              <Link
                href="/product/workflows"
                className="hover:text-[#FF6F61] transition-colors"
              >
                Workflows
              </Link>
            </li>
            <li>
              <Link
                href="/product/campaigns"
                className="hover:text-[#FF6F61] transition-colors"
              >
                Campaigns
              </Link>
            </li>
            <li>
              <Link
                href="/product/reviews"
                className="hover:text-[#FF6F61] transition-colors"
              >
                Reviews
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="hover:text-[#FF6F61] transition-colors"
              >
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: Solutions */}
        <div>
          <h4 className="sb-font-playfair font-bold text-xl text-[#00A5D4] mb-6">
            Solutions
          </h4>
          <ul className="space-y-4 text-sm font-medium text-[#F9F5E7]/70">
            <li>
              <Link
                href="/solutions/dental"
                className="hover:text-[#FF6F61] transition-colors"
              >
                Dental
              </Link>
            </li>
            <li>
              <Link
                href="/solutions/home-services"
                className="hover:text-[#FF6F61] transition-colors"
              >
                Home Services
              </Link>
            </li>
            <li>
              <Link
                href="/solutions/healthcare"
                className="hover:text-[#FF6F61] transition-colors"
              >
                Healthcare
              </Link>
            </li>
            <li>
              <Link
                href="/solutions"
                className="flex items-center gap-1 text-[#00A5D4] hover:text-[#FF6F61] transition-colors font-bold mt-2"
              >
                View All <ArrowRight size={14} />
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div>
          <h4 className="sb-font-playfair font-bold text-xl text-[#00A5D4] mb-6">
            Company
          </h4>
          <ul className="space-y-4 text-sm font-medium text-[#F9F5E7]/70">
            <li>
              <Link
                href="/about"
                className="hover:text-[#FF6F61] transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/resources"
                className="hover:text-[#FF6F61] transition-colors"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-[#FF6F61] transition-colors"
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Legal */}
        <div>
          <h4 className="sb-font-playfair font-bold text-xl text-[#00A5D4] mb-6">
            Legal
          </h4>
          <ul className="space-y-4 text-sm font-medium text-[#F9F5E7]/70">
            <li>
              <Link
                href="/privacy"
                className="hover:text-[#FF6F61] transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-[#FF6F61] transition-colors"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="/sms-terms"
                className="hover:text-[#FF6F61] transition-colors"
              >
                SMS Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM SECTION: Copyright & Socials */}
      <div className="relative z-10 mx-auto max-w-7xl border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[#F9F5E7]/50 font-medium">
          © 2026 SurfBloom, Inc. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-[#F9F5E7]/50 hover:text-[#00A5D4] transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={20} />
          </a>
          <a
            href="https://x.com"
            className="text-[#F9F5E7]/50 hover:text-[#00A5D4] transition-colors"
            aria-label="X"
            target="_blank"
            rel="noopener noreferrer"
          >
            <X size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
