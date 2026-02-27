"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ClipboardList,
  ArrowRight,
  User,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  Star,
  ListTodo,
  MessageSquare,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function SurveysPage() {
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
        {/* Layer 1: Thoughtful / Insightful Background Overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.06] mix-blend-multiply pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=2000')",
          }}
        />

        {/* Layer 2: Modern Grid Fade */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#004D401A_1px,transparent_1px),linear-gradient(to_bottom,#004D401A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto pt-40 md:pt-48 pb-20">
          <div className="hero-elem inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-[#00A5D4]/20 text-[#00A5D4] font-bold text-sm mb-10 shadow-sm">
            <ClipboardList size={18} />
            <span className="tracking-wide uppercase">Smart Surveys</span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-8xl font-bold text-[#004D40] leading-[1.05] mb-8 tracking-tight drop-shadow-sm">
            Stop guessing how your clients{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              feel.
            </span>
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/75 leading-relaxed max-w-4xl mx-auto font-medium">
            A 5-star review doesn't tell you what you're doing right. No review
            at all doesn't tell you anything. SurfBloom surveys give you the
            specific answers you need to improve — tied to real clients, not
            anonymous data.
          </p>
        </div>
      </section>

      {/* SECTION 1: Answers That Go Somewhere */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative flex justify-center">
          {/* CSS Mockup: Survey Response + Workflow Logic */}
          <div className="reveal-item float-ui w-full max-w-md bg-white rounded-[2.5rem] border border-[#00A5D4]/20 shadow-[0_30px_60px_rgba(0,77,64,0.15)] overflow-hidden relative p-6">
            {/* Contact Context Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#00A5D4]/10">
              <div className="w-10 h-10 bg-[#00A5D4]/10 rounded-full flex items-center justify-center text-[#00A5D4] font-bold">
                SJ
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#00A5D4] uppercase tracking-wider mb-0.5">
                  Contact Record
                </p>
                <p className="font-bold text-[#004D40] leading-none">
                  Sarah Jenkins
                </p>
              </div>
              <div className="ml-auto bg-[#10B981]/10 text-[#10B981] px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 size={10} /> Survey Completed
              </div>
            </div>

            {/* Survey Response Block */}
            <div className="bg-[#F9F5E7] p-4 rounded-2xl border border-[#00A5D4]/10 shadow-sm mb-6 relative z-10">
              <p className="text-xs font-bold text-[#004D40] mb-3">
                Q: How likely are you to recommend us?
              </p>

              {/* NPS Score Display */}
              <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-[#004D40]/5 mb-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <div
                    key={num}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${num === 9 ? "bg-[#10B981] text-white shadow-md scale-110" : "bg-[#F9F5E7] text-[#004D40]/40"}`}
                  >
                    {num}
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#004D40]/70 italic border-l-2 border-[#10B981]/50 pl-2">
                "The team was incredibly fast and the service was flawless."
              </p>
            </div>

            {/* Workflow Logic Section */}
            <div className="relative pt-4">
              {/* Connecting line from survey to logic */}
              <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 w-0.5 h-6 bg-[#00A5D4]/20 z-0"></div>

              <div className="flex items-center justify-center gap-2 mb-4 bg-white relative z-10 w-max mx-auto px-2">
                <GitBranch size={14} className="text-[#00A5D4]" />
                <span className="text-[10px] font-bold text-[#00A5D4] uppercase tracking-wider">
                  Workflow Triggered
                </span>
              </div>

              <div className="flex gap-4 relative">
                {/* Horizontal branch line */}
                <div className="absolute top-4 left-[25%] right-[25%] h-0.5 bg-[#00A5D4]/20 z-0"></div>

                {/* Left Branch (Inactive/Low Score) */}
                <div className="flex-1 flex flex-col items-center opacity-40 grayscale">
                  <div className="w-0.5 h-4 bg-[#00A5D4]/20 mb-1"></div>
                  <span className="text-[9px] font-bold text-[#FF6F61] bg-[#FF6F61]/10 px-2 py-0.5 rounded mb-2 border border-[#FF6F61]/20">
                    Score {"<"} 7
                  </span>
                  <div className="bg-white border border-[#004D40]/20 p-2 rounded-xl text-center w-full shadow-sm">
                    <ListTodo
                      size={14}
                      className="mx-auto mb-1 text-[#004D40]"
                    />
                    <p className="text-[9px] font-bold text-[#004D40]">
                      Create Follow-up Task
                    </p>
                  </div>
                </div>

                {/* Right Branch (Active/High Score) */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-0.5 h-4 bg-[#10B981] mb-1"></div>
                  <span className="text-[9px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded mb-2 border border-[#10B981]/30">
                    Score {">="} 8
                  </span>
                  <div className="bg-white border-2 border-[#10B981] p-2 rounded-xl text-center w-full shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-[#10B981]/10 rounded-full blur-md"></div>
                    <Star
                      size={14}
                      className="mx-auto mb-1 text-[#10B981] fill-current"
                    />
                    <p className="text-[9px] font-bold text-[#004D40]">
                      Request Google Review
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="inline-block bg-[#00A5D4]/10 text-[#00A5D4] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-[#00A5D4]/20">
            Answers That Go Somewhere
          </div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Every response connects to a person and a{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              workflow
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Build short surveys and send them after visits, services, or
              milestones — automatically through a workflow or manually from a
              contact record. Responses don't land in a spreadsheet nobody
              checks.
            </p>
            <p>
              Every answer ties back to the client who gave it, visible on their
              contact record alongside every text, task, and review. Set
              thresholds that trigger action — score below 3 creates a follow-up
              task, score above 4 routes them to leave a Google review.
            </p>
            <p className="font-semibold text-[#004D40]">
              Track trends over time to spot what's working, what's slipping,
              and where your team needs support. The data is only useful if it
              goes somewhere. SurfBloom makes sure it does.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
