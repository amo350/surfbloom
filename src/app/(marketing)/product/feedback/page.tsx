"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MessageCircle,
  ArrowRight,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ListTodo,
  UserCheck,
  ShieldCheck,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function FeedbackPage() {
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
        y: -10,
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
        {/* Layer 1: Empathetic/Soft Background Overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.06] mix-blend-multiply pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=2000')",
          }}
        />

        {/* Layer 2: Modern Grid Fade */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#004D401A_1px,transparent_1px),linear-gradient(to_bottom,#004D401A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto pt-40 md:pt-48 pb-20">
          <div className="hero-elem inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-[#00A5D4]/20 text-[#00A5D4] font-bold text-sm mb-10 shadow-sm">
            <ShieldCheck size={18} />
            <span className="tracking-wide uppercase">Private Feedback</span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-8xl font-bold text-[#004D40] leading-[1.05] mb-8 tracking-tight drop-shadow-sm">
            Hear it privately before they say it{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              publicly.
            </span>
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/75 leading-relaxed max-w-4xl mx-auto font-medium">
            Not every unhappy client leaves a review — most just leave.
            SurfBloom gives them a private channel to tell you what went wrong
            before they tell Google. You get the chance to fix it. They get the
            feeling someone actually cares.
          </p>
        </div>
      </section>

      {/* SECTION 1: Turn Complaints Into Saves */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative flex justify-center">
          {/* CSS Mockup: Split Flow Diagram */}
          <div className="reveal-item float-ui w-full max-w-lg bg-white rounded-[2.5rem] border border-[#00A5D4]/20 shadow-[0_30px_60px_rgba(0,77,64,0.1)] p-8 relative overflow-hidden">
            {/* Header */}
            <div className="text-center mb-6 relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#00A5D4]/10 text-[#00A5D4] mb-3 shadow-sm border border-[#00A5D4]/20">
                <MessageCircle size={24} />
              </div>
              <h3 className="font-bold text-[#004D40] text-lg">
                Initial Feedback Prompt
              </h3>
              <p className="text-xs text-[#004D40]/60">
                "How was your experience today?"
              </p>
            </div>

            {/* Tree Structure */}
            <div className="relative flex flex-col items-center">
              {/* Vertical line from Prompt to Split */}
              <div className="w-0.5 h-6 bg-[#00A5D4]/20"></div>

              {/* Horizontal Split Line */}
              <div className="w-[70%] h-0.5 bg-[#00A5D4]/20 relative">
                <div className="absolute left-0 top-0 w-0.5 h-4 bg-[#00A5D4]/20"></div>
                <div className="absolute right-0 top-0 w-0.5 h-4 bg-[#00A5D4]/20"></div>
              </div>

              {/* Branch Container */}
              <div className="flex justify-between w-[85%] mt-4 relative z-10">
                {/* Left Branch: Happy (4-5 Stars) */}
                <div className="flex flex-col items-center w-[45%]">
                  <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-3 w-full text-center shadow-sm mb-4 relative">
                    <ThumbsUp
                      size={16}
                      className="text-[#10B981] mx-auto mb-1"
                    />
                    <p className="text-[10px] font-bold text-[#004D40] uppercase">
                      Happy
                    </p>
                    <p className="text-[9px] text-[#004D40]/60">4-5 Stars</p>
                    {/* Flow Arrow */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-[#10B981]/30"></div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 border-solid border-t-[#10B981]/30 border-t-4 border-x-transparent border-x-4 border-b-0"></div>
                  </div>

                  {/* Result: Google Review */}
                  <div className="bg-white border border-[#00A5D4]/20 rounded-xl p-3 w-full text-center shadow-md mt-1">
                    <Star
                      size={16}
                      className="text-[#FFD54F] fill-current mx-auto mb-1"
                    />
                    <p className="text-[10px] font-bold text-[#004D40]">
                      Route to Google
                    </p>
                    <p className="text-[8px] text-[#00A5D4] mt-1 font-semibold">
                      review.link/google
                    </p>
                  </div>
                </div>

                {/* Right Branch: Unhappy (1-3 Stars) */}
                <div className="flex flex-col items-center w-[45%]">
                  <div className="bg-[#FF6F61]/10 border border-[#FF6F61]/30 rounded-xl p-3 w-full text-center shadow-sm mb-4 relative">
                    <ThumbsDown
                      size={16}
                      className="text-[#FF6F61] mx-auto mb-1"
                    />
                    <p className="text-[10px] font-bold text-[#004D40] uppercase">
                      Unhappy
                    </p>
                    <p className="text-[9px] text-[#004D40]/60">1-3 Stars</p>
                    {/* Flow Arrow */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-[#FF6F61]/30"></div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 border-solid border-t-[#FF6F61]/30 border-t-4 border-x-transparent border-x-4 border-b-0"></div>
                  </div>

                  {/* Result Sequence: Private Form -> Task */}
                  <div className="w-full space-y-2 mt-1">
                    <div className="bg-white border border-[#FF6F61]/30 rounded-lg p-2 flex items-center gap-2 shadow-sm">
                      <AlertTriangle size={12} className="text-[#FF6F61]" />
                      <p className="text-[9px] font-bold text-[#004D40]">
                        Private Form
                      </p>
                    </div>
                    <div className="mx-auto w-0.5 h-2 bg-[#004D40]/10"></div>
                    <div className="bg-white border border-[#FF6F61]/30 rounded-lg p-2 flex items-center gap-2 shadow-sm">
                      <ListTodo size={12} className="text-[#FF6F61]" />
                      <p className="text-[9px] font-bold text-[#004D40]">
                        Task Created
                      </p>
                    </div>
                    <div className="mx-auto w-0.5 h-2 bg-[#004D40]/10"></div>
                    <div className="bg-white border border-[#FF6F61]/30 rounded-lg p-2 flex items-center gap-2 shadow-sm">
                      <UserCheck size={12} className="text-[#FF6F61]" />
                      <p className="text-[9px] font-bold text-[#004D40]">
                        Team Follow-up
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="inline-block bg-[#FF6F61]/10 text-[#FF6F61] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-[#FF6F61]/20">
            Turn Complaints Into Saves
          </div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Bad experiences don't have to end{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              badly
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              After a visit, service, or purchase, SurfBloom sends a short
              feedback prompt. Happy clients get routed to leave a Google
              review. Unhappy clients get routed to a private form where they
              can tell you exactly what happened.
            </p>
            <p>
              That negative response triggers a workflow — task created, team
              member assigned, follow-up sent — all before the client opens
              Google to write something you can't take back.
            </p>
            <p className="font-semibold text-[#004D40]">
              Every response ties to the contact record so when your team
              reaches out, they already know who, what, and when. No cold calls,
              no guessing, no "sorry, who is this again?"
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
