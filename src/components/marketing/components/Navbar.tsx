"use client";

import { ChevronDown, Menu, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BookDemoModal from "./BookDemoModal";

const SOLUTIONS = [
  { name: "Dental", href: "/solutions/dental" },
  { name: "Home Services", href: "/solutions/home-services" },
  { name: "Healthcare", href: "/solutions/healthcare" },
  { name: "Storage", href: "/solutions/storage" },
  { name: "Real Estate", href: "/solutions/real-estate" },
  { name: "Automotive", href: "/solutions/automotive" },
  { name: "Fitness & Wellness", href: "/solutions/fitness-wellness" },
  { name: "Financial Services", href: "/solutions/financial-services" },
  { name: "Legal", href: "/solutions/legal" },
  { name: "Retail", href: "/solutions/retail" },
  { name: "Property Management", href: "/solutions/property-management" },
  { name: "Food & Hospitality", href: "/solutions/food-hospitality" },
];

type ProductLink = { name: string; href: string; badge?: string };

const PRODUCT_SECTIONS: { title: string; links: ProductLink[] }[] = [
  {
    title: "Project Management",
    links: [
      { name: "Workflows", href: "/product/workflows" },
      { name: "Tasks", href: "/product/tasks" },
      { name: "Executions", href: "/product/executions" },
    ],
  },
  {
    title: "Marketing",
    links: [
      { name: "Campaigns", href: "/product/campaigns" },
      { name: "Contacts (CRM)", href: "/product/contacts" },
      { name: "Conversations", href: "/product/conversations" },
    ],
  },
  {
    title: "Reputation",
    links: [
      { name: "Reviews", href: "/product/reviews" },
      { name: "Feedback", href: "/product/feedback" },
      { name: "Surveys", href: "/product/surveys" },
    ],
  },
  {
    title: "Insights",
    links: [{ name: "Analytics", href: "/product/analytics" }],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add a subtle shadow/blur enhancement when scrolling down
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 px-6 pb-4 pt-6">
        <nav
          className={`pointer-events-auto mx-auto flex max-w-7xl items-center justify-between rounded-4xl border transition-all duration-500 ${
            scrolled
              ? "border-white/40 bg-white/70 px-6 py-3 shadow-[0_8px_32px_rgba(0,77,64,0.1)] backdrop-blur-xl"
              : "border-transparent bg-transparent px-8 py-6"
          }`}
        >
          {/* FAR LEFT: Logo only */}
          <Link
            href="/"
            className="sb-font-playfair flex items-center gap-2 text-2xl font-bold text-[#004D40] transition-opacity hover:opacity-80"
            onClick={(event) => {
              if (pathname === "/") {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                setMobileMenuOpen(false);
              }
            }}
          >
            <Image
              src="/logo.png"
              alt="SurfBloom logo"
              width={36}
              height={36}
              className="h-10 w-10 rounded-full object-contain mt-.5"
            />
            SurfBloom
          </Link>

          {/* CENTER-RIGHT: Routes (left of separator) */}
          <div className="hidden flex-1 items-center justify-end gap-6 text-[15px] font-semibold tracking-tight text-[#004D40] lg:flex">
            {/* SOLUTIONS DROPDOWN */}
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1 py-2 transition-colors hover:text-[#00A5D4]"
              >
                Solutions{" "}
                <ChevronDown className="h-4 w-4 opacity-50 transition-transform group-hover:rotate-180" />
              </button>

              {/* Invisible hover bridge to prevent menu from closing when mouse moves to it */}
              <div className="absolute left-0 top-full h-4 w-full" />

              <div className="invisible absolute left-1/2 top-[calc(100%+0.5rem)] w-80 -translate-x-1/2 translate-y-2 rounded-3xl border border-[#00A5D4]/15 bg-white/95 p-3 shadow-xl backdrop-blur-xl opacity-0 transition-all duration-300 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="grid max-h-[60vh] grid-cols-2 gap-x-4 overflow-y-auto">
                  {SOLUTIONS.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="rounded-xl px-4 py-2.5 text-sm text-[#004D40]/80 transition-colors hover:bg-[#00A5D4]/10 hover:text-[#00A5D4]"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* PRODUCT MEGA-MENU DROPDOWN */}
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1 py-2 transition-colors hover:text-[#00A5D4]"
              >
                Product{" "}
                <ChevronDown className="h-4 w-4 opacity-50 transition-transform group-hover:rotate-180" />
              </button>

              <div className="absolute left-0 top-full h-4 w-full" />

              {/* Mega Menu Container */}
              <div className="invisible absolute left-1/2 top-[calc(100%+0.5rem)] w-[700px] -translate-x-1/2 translate-y-2 rounded-[2.5rem] border border-[#00A5D4]/15 bg-white/95 p-8 shadow-2xl backdrop-blur-xl opacity-0 transition-all duration-300 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="grid grid-cols-4 gap-8">
                  {PRODUCT_SECTIONS.map((section) => (
                    <div key={section.title}>
                      <h4 className="sb-font-playfair mb-4 text-sm font-bold uppercase tracking-wider text-[#00A5D4]">
                        {section.title}
                      </h4>
                      <div className="flex flex-col gap-2">
                        {section.links.map((link) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            className="group/link flex items-center gap-2 py-1 text-sm text-[#004D40]/80 transition-colors hover:text-[#FF6F61]"
                          >
                            {link.name}
                            {link.badge && (
                              <span className="flex items-center gap-1 rounded-full bg-[#FF6F61]/10 px-2 py-0.5 text-[10px] font-bold text-[#FF6F61]">
                                <Sparkles size={10} />
                                {link.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/resources"
              className="py-2 transition-colors hover:text-[#00A5D4]"
            >
              Resources
            </Link>
            <Link
              href="/pricing"
              className="py-2 transition-colors hover:text-[#00A5D4]"
            >
              Pricing
            </Link>
          </div>

          {/* RIGHT SIDE: Divider, Login, Demo */}
          <div className="ml-8 flex items-center gap-6">
            <div className="hidden h-6 w-px bg-[#004D40]/20 lg:block" />{" "}
            {/* Divider */}
            <Link
              href="/login"
              className="hidden text-[15px] font-semibold text-[#004D40] transition-colors hover:text-[#00A5D4] lg:block"
            >
              Login
            </Link>
            <button
              type="button"
              className="btn-magnetic hidden rounded-full bg-[#FF6F61] px-6 py-2.5 text-[15px] font-bold text-[#F9F5E7] shadow-[0_4px_14px_rgba(255,111,97,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,111,97,0.4)] lg:inline-flex"
              onClick={() => setIsModalOpen(true)}
            >
              Book a Demo
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-[#00A5D4]/25 bg-white/80 p-2.5 text-[#004D40] shadow-sm backdrop-blur-sm transition-colors hover:text-[#00A5D4] lg:hidden"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="pointer-events-auto mx-auto mt-2 max-w-7xl lg:hidden">
            <div className="max-h-[75vh] overflow-y-auto rounded-3xl border border-[#00A5D4]/20 bg-white/95 p-4 shadow-[0_12px_30px_rgba(0,77,64,0.12)] backdrop-blur-xl">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className="rounded-xl bg-[#FF6F61] px-4 py-2.5 text-left text-sm font-bold text-[#F9F5E7]"
                  onClick={() => {
                    setIsModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Book a Demo
                </button>

                <Link
                  href="/pricing"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#004D40] transition-colors hover:bg-[#00A5D4]/10 hover:text-[#00A5D4]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/resources"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#004D40] transition-colors hover:bg-[#00A5D4]/10 hover:text-[#00A5D4]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Resources
                </Link>

                <div className="my-2 h-px bg-[#00A5D4]/15" />

                <p className="px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#00A5D4]/80">
                  Product
                </p>
                {PRODUCT_SECTIONS.flatMap((section) => section.links).map(
                  (link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="rounded-xl px-4 py-2 text-sm text-[#004D40]/85 transition-colors hover:bg-[#00A5D4]/10 hover:text-[#00A5D4]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ),
                )}

                <div className="my-2 h-px bg-[#00A5D4]/15" />

                <p className="px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#00A5D4]/80">
                  Solutions
                </p>
                {SOLUTIONS.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="rounded-xl px-4 py-2 text-sm text-[#004D40]/85 transition-colors hover:bg-[#00A5D4]/10 hover:text-[#00A5D4]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="mt-2 h-px bg-[#00A5D4]/15" />

                <Link
                  href="/login"
                  className="mt-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#004D40] transition-colors hover:bg-[#00A5D4]/10 hover:text-[#00A5D4]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <BookDemoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
