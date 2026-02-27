"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  MessageSquare,
  Bot,
  Smartphone,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ExecutionsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from(".hero-elem", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.1,
      });

      // Scroll reveals for standard sections
      const sections = gsap.utils.toArray<HTMLElement>(".scroll-section");
      sections.forEach((sec) => {
        gsap.from(sec.querySelectorAll(".reveal-item"), {
          scrollTrigger: {
            trigger: sec,
            start: "top 75%",
          },
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power2.out",
        });
      });

      // Floating animation for UI elements
      gsap.to(".float-ui", {
        y: -12,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#F9F5E7] selection:bg-[#FF6F61] selection:text-white pb-32 font-montserrat"
    >
      {/* TEXT-ONLY HERO SECTION */}
      <section className="relative min-h-[75vh] flex flex-col justify-center items-center text-center px-6 md:px-12 overflow-hidden bg-[#F9F5E7]">
        {/* Layer 1: Tropical Palm Shadows (Muted & Elegant) */}
        <div
          className="absolute inset-0 z-0 opacity-[0.05] mix-blend-multiply pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1615800098779-1be32e71225c?auto=format&fit=crop&w=2000&q=80')",
          }}
        />

        {/* Layer 2: Modern Grid Fade */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#004D401A_1px,transparent_1px),linear-gradient(to_bottom,#004D401A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto pt-40 md:pt-48 pb-20">
          <h1 className="hero-elem sb-font-playfair text-6xl md:text-8xl font-bold text-[#004D40] leading-[1.05] mb-8 tracking-tight drop-shadow-sm">
            See exactly what happened — and{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              when
            </span>
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/75 leading-relaxed max-w-4xl mx-auto font-medium">
            Every workflow execution is logged step by step. Which contact
            triggered it, which nodes fired, what was sent, and whether it
            worked. No guessing if that review request actually went out. Open
            the log and see for yourself.
          </p>
        </div>
      </section>

      {/* SECTION 1: Full Visibility */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative flex justify-center">
          {/* High-Fidelity CSS Mockup of the Execution Log */}
          <div className="reveal-item float-ui w-full max-w-lg bg-white rounded-[2.5rem] border border-[#00A5D4]/20 shadow-[0_30px_60px_rgba(0,77,64,0.1)] overflow-hidden relative">
            {/* Log Header */}
            <div className="bg-[#F9F5E7]/50 border-b border-[#00A5D4]/10 p-6 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#004D40] text-lg">
                  Execution #8924
                </h3>
                <p className="text-sm text-[#004D40]/60 font-mono mt-1">
                  The Review Machine
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white border border-[#004D40]/10 px-3 py-1.5 rounded-xl shadow-sm">
                <Filter size={14} className="text-[#00A5D4]" />
                <span className="text-xs font-bold text-[#004D40] uppercase">
                  Timeline
                </span>
              </div>
            </div>

            {/* Step-by-Step Timeline */}
            <div className="p-8 relative">
              {/* Connecting Line */}
              <div className="absolute left-[2.85rem] top-10 bottom-10 w-0.5 bg-gradient-to-b from-[#00A5D4]/30 via-[#00A5D4]/30 to-[#FF8A7A]/30"></div>

              {/* Step 1: Trigger */}
              <div className="flex gap-6 mb-8 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-[#00A5D4] flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 size={18} className="text-[#00A5D4]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#004D40]/50 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Clock size={12} /> Today, 10:42 AM
                  </p>
                  <h4 className="font-bold text-[#004D40] text-lg">
                    Appointment Completed
                  </h4>
                  <p className="text-sm text-[#004D40]/70 mt-1">
                    Triggered by contact:{" "}
                    <span className="font-semibold text-[#00A5D4]">
                      Marcus J.
                    </span>
                  </p>
                </div>
              </div>

              {/* Step 2: AI Generation (The "Glass Box") */}
              <div className="flex gap-6 mb-8 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-[#00A5D4] flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={18} className="text-[#00A5D4]" />
                </div>
                <div className="flex-grow">
                  <p className="text-xs font-bold text-[#004D40]/50 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Clock size={12} /> Today, 10:42 AM
                  </p>
                  <h4 className="font-bold text-[#004D40] text-lg mb-2">
                    AI Node Generated Draft
                  </h4>
                  {/* The actual AI output visible to the user */}
                  <div className="bg-[#F9F5E7] border border-[#00A5D4]/15 rounded-xl p-4 relative">
                    <div className="absolute -left-2 top-4 w-4 h-4 bg-[#F9F5E7] border-l border-t border-[#00A5D4]/15 rotate-45"></div>
                    <p className="text-sm text-[#004D40]/80 italic relative z-10">
                      "Hi Marcus, thanks for choosing SurfBloom Dental today!
                      We'd love to hear about your visit. Mind leaving a quick
                      review?"
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-[#00A5D4]/10 pt-2">
                      <span className="text-[10px] font-mono text-[#00A5D4] font-bold">
                        MODEL: CLAUDE 3
                      </span>
                      <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
                        SUCCESS
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Action (Error example) */}
              <div className="flex gap-6 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-[#FF8A7A] flex items-center justify-center shrink-0 shadow-sm relative">
                  <Smartphone size={18} className="text-[#FF8A7A]" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#FF8A7A] rounded-full flex items-center justify-center border-2 border-white">
                    <AlertCircle size={10} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#004D40]/50 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Clock size={12} /> Today, 10:43 AM
                  </p>
                  <h4 className="font-bold text-[#FF8A7A] text-lg">
                    SMS Failed to Deliver
                  </h4>
                  <p className="text-sm text-[#004D40]/70 mt-1">
                    Error:{" "}
                    <span className="font-mono text-[#FF8A7A] text-xs bg-[#FF8A7A]/10 px-1 py-0.5 rounded">
                      ERR_INVALID_NUMBER
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Every node, every message, every{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              outcome
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              When a workflow runs, SurfBloom records the entire execution — the
              trigger that started it, every node it passed through, and the
              result of each step.
            </p>
            <p>
              AI generated a review request? You can read exactly what it wrote.
              SMS failed to deliver? You'll see why. A logic branch sent a
              contact down the wrong path? You'll catch it in seconds, not
              weeks.
            </p>
            <p className="font-semibold text-[#004D40]">
              Filter by workflow, contact, status, or date range. Spot failed
              executions before they become missed opportunities.
            </p>
            <div className="p-6 rounded-[2rem] bg-white border border-[#00A5D4]/15 shadow-sm text-left relative overflow-hidden mt-6">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00A5D4]"></div>
              <p className="font-medium text-[#004D40]">
                Your workflows aren't a black box — they're a{" "}
                <span className="font-bold text-[#00A5D4]">glass box</span> with
                a paper trail.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
