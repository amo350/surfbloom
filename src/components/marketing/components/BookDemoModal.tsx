"use client";

import { ArrowRight, ShieldCheck, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookDemoModal({ isOpen, onClose }: BookDemoModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Handle escape key to close
  useEffect(() => {
    setIsMounted(true);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isMounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[1000] bg-[#004D40]/40 backdrop-blur-sm transition-opacity duration-300 flex items-start justify-center p-4 pt-24 md:items-center md:p-6 md:pt-6 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      >
        {/* Modal Container */}
        <div
          className={`relative w-full max-w-5xl bg-[#F9F5E7] rounded-[2rem] shadow-[0_50px_100px_rgba(0,77,64,0.3)] overflow-hidden flex flex-col md:flex-row max-h-[calc(100dvh-7rem)] md:max-h-[85vh] transition-transform duration-500 delay-100 ${
            isOpen ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* LEFT SIDE: The Immersion Break */}
          <div className="hidden md:flex w-5/12 bg-gradient-to-br from-[#00A5D4] to-[#004D40] relative flex-col justify-between p-12 text-white overflow-hidden">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none">
              <Image
                src="https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=1200&q=80"
                alt="Tropical ocean texture"
                fill
                className="object-cover"
              />
            </div>

            {/* Sun Glare Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD54F]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-12">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white p-1">
                  <Image
                    src="/logo.png"
                    alt="SurfBloom"
                    width={36}
                    height={36}
                    className="rounded-full object-contain"
                  />
                </div>
                <span className="font-bold text-xl tracking-tight">
                  SurfBloom
                </span>
              </div>

              <h2 className="sb-font-playfair text-4xl lg:text-5xl font-bold leading-tight mb-6 drop-shadow-sm">
                Ready to find <br />
                <span className="sb-font-great-vibes italic text-[#FFD54F] font-normal text-5xl lg:text-6xl pr-2">
                  your
                </span>{" "}
                flow?
              </h2>
              <p className="text-white/80 text-lg leading-relaxed font-medium">
                Join the local businesses stepping out of the weeds and letting
                automation run the daily grind.
              </p>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="text-[#10B981] shrink-0 mt-0.5"
                />
                <div>
                  <p className="font-bold text-sm mb-1">
                    Zero pressure walkthrough
                  </p>
                  <p className="text-xs text-white/70">
                    We'll look at your current setup and show you exactly what
                    SurfBloom can automate for you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: The Form */}
          <div className="w-full md:w-7/12 p-8 md:p-12 overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 bg-white border border-[#00A5D4]/10 rounded-full flex items-center justify-center text-[#004D40]/50 hover:text-[#004D40] hover:bg-[#F9F5E7] hover:border-[#00A5D4]/30 transition-all shadow-sm z-20"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="max-w-md mx-auto md:mx-0 mt-4 md:mt-0">
              <h3 className="text-3xl font-bold text-[#004D40] mb-2 tracking-tight">
                Let's talk about your business.
              </h3>
              <p className="text-[#004D40]/70 font-medium mb-8">
                Fill out a few details and we'll reach out to schedule a
                walkthrough.
              </p>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="firstName"
                      className="text-xs font-bold text-[#004D40] uppercase tracking-wider ml-1"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      required
                      className="w-full bg-white border border-[#00A5D4]/20 rounded-xl px-4 py-3.5 text-[#004D40] font-medium placeholder-[#004D40]/30 focus:outline-none focus:ring-2 focus:ring-[#00A5D4]/50 focus:border-[#00A5D4] shadow-sm transition-all"
                      placeholder="Max"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="lastName"
                      className="text-xs font-bold text-[#004D40] uppercase tracking-wider ml-1"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      required
                      className="w-full bg-white border border-[#00A5D4]/20 rounded-xl px-4 py-3.5 text-[#004D40] font-medium placeholder-[#004D40]/30 focus:outline-none focus:ring-2 focus:ring-[#00A5D4]/50 focus:border-[#00A5D4] shadow-sm transition-all"
                      placeholder="Rael"
                    />
                  </div>
                </div>

                {/* Company & Email Row */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="company"
                    className="text-xs font-bold text-[#004D40] uppercase tracking-wider ml-1"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    required
                    className="w-full bg-white border border-[#00A5D4]/20 rounded-xl px-4 py-3.5 text-[#004D40] font-medium placeholder-[#004D40]/30 focus:outline-none focus:ring-2 focus:ring-[#00A5D4]/50 focus:border-[#00A5D4] shadow-sm transition-all"
                    placeholder="Mountain West"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-bold text-[#004D40] uppercase tracking-wider ml-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full bg-white border border-[#00A5D4]/20 rounded-xl px-4 py-3.5 text-[#004D40] font-medium placeholder-[#004D40]/30 focus:outline-none focus:ring-2 focus:ring-[#00A5D4]/50 focus:border-[#00A5D4] shadow-sm transition-all"
                    placeholder="max@example.com"
                  />
                </div>

                {/* Phone & Locations Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="phone"
                      className="text-xs font-bold text-[#004D40] uppercase tracking-wider ml-1"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      className="w-full bg-white border border-[#00A5D4]/20 rounded-xl px-4 py-3.5 text-[#004D40] font-medium placeholder-[#004D40]/30 focus:outline-none focus:ring-2 focus:ring-[#00A5D4]/50 focus:border-[#00A5D4] shadow-sm transition-all"
                      placeholder="(555) 000-0000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="locations"
                      className="text-xs font-bold text-[#004D40] uppercase tracking-wider ml-1"
                    >
                      Number of Locations
                    </label>
                    <select
                      id="locations"
                      name="locations"
                      defaultValue=""
                      required
                      className="w-full bg-white border border-[#00A5D4]/20 rounded-xl px-4 py-3.5 text-[#004D40] font-medium focus:outline-none focus:ring-2 focus:ring-[#00A5D4]/50 focus:border-[#00A5D4] shadow-sm transition-all appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23004D40' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 1rem center",
                        backgroundSize: "1.2em",
                      }}
                    >
                      <option value="" disabled>
                        Select...
                      </option>
                      <option value="1">1</option>
                      <option value="2-5">2-5</option>
                      <option value="6-10">6-10</option>
                      <option value="11-25">11-25</option>
                      <option value="25+">25+</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-[#FF6F61] hover:bg-[#D94E40] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-lg shadow-[0_10px_20px_rgba(255,111,97,0.3)] hover:shadow-[0_15px_25px_rgba(255,111,97,0.4)] hover:-translate-y-0.5"
                  >
                    Submit <ArrowRight size={20} />
                  </button>
                </div>

                <p className="text-[10px] text-[#004D40]/50 text-center mt-4">
                  By submitting, you agree to receive a welcome text from us.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
