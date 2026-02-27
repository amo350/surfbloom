"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FileText,
  Download,
  ArrowRight,
  BookOpen,
  FileCheck,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ResourcesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-elem", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      });

      gsap.from(".resource-card", {
        scrollTrigger: {
          trigger: ".resource-grid",
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#F9F5E7] selection:bg-[#FF6F61] selection:text-white pb-32 font-montserrat"
    >
      {/* HEADER SECTION */}
      <section className="pt-40 md:pt-48 pb-20 px-6 md:px-12 text-center relative overflow-hidden">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#004D401A_1px,transparent_1px),linear-gradient(to_bottom,#004D401A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="hero-elem inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-[#00A5D4]/20 text-[#00A5D4] font-bold text-sm mb-8 shadow-sm">
            <BookOpen size={18} />
            <span className="tracking-wide uppercase">Free Resources</span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-5xl md:text-7xl font-bold text-[#004D40] leading-tight mb-6">
            Guides, templates, and{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-2">
              playbooks.
            </span>
          </h1>

          <p className="hero-elem text-xl text-[#004D40]/70 max-w-2xl mx-auto font-medium">
            Everything you need to stop guessing and start growing. Actionable
            resources built for local businesses.
          </p>
        </div>
      </section>

      {/* RESOURCE GRID */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto resource-grid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Marketing Checklist */}
          <div className="resource-card bg-white rounded-[2rem] border border-[#00A5D4]/15 shadow-sm hover:shadow-[0_20px_40px_rgba(0,165,212,0.1)] hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden group">
            {/* Visual Header */}
            <div className="h-48 bg-gradient-to-br from-[#00A5D4] to-[#007A9E] p-6 relative overflow-hidden flex items-end">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
              <FileCheck
                size={80}
                className="absolute -right-4 -bottom-4 text-white/10 transform -rotate-12"
              />
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/30">
                Guide
              </span>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-[#004D40] mb-3 leading-snug group-hover:text-[#00A5D4] transition-colors">
                The Local Business Marketing Checklist
              </h3>
              <p className="text-[#004D40]/70 text-sm leading-relaxed mb-8 flex-grow">
                15 things every local business should have in place before
                spending a dollar on ads. From claiming your Google profile to
                automating your review requests.
              </p>

              <Link
                href="/resources/marketing-checklist"
                className="inline-flex items-center justify-center gap-2 w-full bg-[#F9F5E7] hover:bg-[#FF6F61] text-[#004D40] hover:text-white font-bold py-3.5 rounded-xl transition-colors border border-[#004D40]/10 hover:border-[#FF6F61]"
              >
                <Download size={18} />
                Download PDF
              </Link>
            </div>
          </div>

          {/* Scalable Empty States (To show grid architecture) */}
          <div className="resource-card bg-[#F9F5E7]/50 rounded-[2rem] border-2 border-dashed border-[#00A5D4]/20 flex flex-col items-center justify-center text-center p-8 min-h-[400px] opacity-70">
            <FileText size={32} className="text-[#00A5D4]/40 mb-4" />
            <p className="font-bold text-[#004D40]/50 uppercase tracking-wider text-sm mb-2">
              Coming Soon
            </p>
            <p className="text-[#004D40]/40 text-xs">
              More playbooks are in the works.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
