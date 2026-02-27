"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Waves,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BookDemoModal from "@/components/marketing/components/BookDemoModal";

gsap.registerPlugin(ScrollTrigger);

export default function PricingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro text and cards stagger in together
      gsap.from(".hero-elem", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.1,
      });

      // Immersive break section text reveal
      gsap.from(".impact-text", {
        scrollTrigger: {
          trigger: ".impact-section",
          start: "top 75%",
        },
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1.2,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#F9F5E7] selection:bg-[#FF6F61] selection:text-white pb-24 font-montserrat"
    >
      {/* COMBINED HERO & PRICING CARDS SECTION */}
      <section className="relative pt-32 md:pt-40 pb-24 px-6 md:px-12 flex flex-col items-center min-h-[90vh] justify-center">
        {/* Beautiful sweeping gradient background replacing the old hero */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#00A5D4]/10 via-[#F9F5E7] to-[#F9F5E7] pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-white/60 to-transparent pointer-events-none z-0"></div>

        {/* Intro Text
        <div className="relative z-10 max-w-3xl mx-auto text-center mb-10">
          <h1 className="hero-elem sb-font-playfair text-5xl md:text-6xl lg:text-7xl font-bold text-[#004D40] leading-tight mb-4 tracking-tight">
            Simple pricing. Built around{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-2">
              your
            </span>{" "}
            business.
          </h1>
          <p className="hero-elem text-lg md:text-xl text-[#004D40]/75 leading-relaxed font-medium">
            Every local business runs differently. We'll build a package around
            what you actually need, not charge you for what you don't.
          </p>
        </div> */}

        {/* PRICING CARDS */}
        <div className="relative z-20 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* CARD 1: SurfBloom (Compact & Clean) */}
          <div className="hero-elem bg-white rounded-3xl p-6 md:p-8 border border-[#00A5D4]/20 shadow-[0_20px_40px_rgba(0,77,64,0.08)] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A5D4]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 transition-transform group-hover:scale-110"></div>

            <div className="relative z-10 mb-6 pb-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-[#004D40] mb-1">
                SurfBloom
              </h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl md:text-4xl font-extrabold text-[#00A5D4] tracking-tight">
                  Custom pricing
                </span>
              </div>
              <p className="text-[#004D40]/60 font-medium text-sm">
                Everything connected. Nothing siloed.
              </p>
            </div>

            {/* Dense 2-Column Grid to save vertical height */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-8 flex-grow relative z-10">
              {[
                "Workflows",
                "Surveys",
                "AI messaging",
                "Tasks",
                "AI chatbot",
                "CRM",
                "Campaigns",
                "Conversations",
                "Reviews",
                "Analytics",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#10B981] shrink-0" />
                  <span className="text-[#004D40] font-medium text-sm">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="relative z-10 w-full bg-[#F9F5E7] hover:bg-[#00A5D4] text-[#004D40] hover:text-white border border-[#00A5D4]/20 hover:border-[#00A5D4] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-base shadow-sm hover:shadow-md"
              onClick={() => setIsModalOpen(true)}
            >
              <PhoneCall size={18} /> Book a Call
            </button>
          </div>

          {/* CARD 2: Maui (Premium with Superhero Watermark) */}
          <div className="hero-elem bg-gradient-to-br from-[#00332A] via-[#001A15] to-[#000000] rounded-3xl p-6 md:p-8 border border-[#FFD54F]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden group">
            {/* Superhero Background Logo */}
            <div className="absolute -top-12 -right-12 w-80 h-80 opacity-15 pointer-events-none z-0 transform group-hover:scale-105 transition-transform duration-700 ease-out">
              <Image
                src="/logos/maui-logo.png"
                alt="Maui Logo Background"
                fill
                className="object-contain drop-shadow-[0_0_30px_rgba(255,213,79,0.8)]"
              />
            </div>

            {/* Subtle glow layers */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD54F]/10 rounded-full blur-[60px] -translate-y-1/4 translate-x-1/4 z-0"></div>

            <div className="relative z-10 mb-6 pb-6 border-b border-white/10">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles size={20} className="text-[#FFD54F]" /> Maui
                </h2>
                <span className="bg-[#FFD54F]/10 text-[#FFD54F] border border-[#FFD54F]/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Fully Managed
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Let's talk.
                </span>
              </div>
              <p className="text-white/80 font-medium text-sm mb-3">
                Your business. Running itself.
              </p>
              <div className="bg-white/5 border border-white/10 p-2 rounded-lg backdrop-blur-sm">
                <p className="text-[#FFD54F] text-xs font-semibold">
                  SurfBloom is the platform. Maui is the one using it.
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-8 flex-grow relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} className="text-[#00A5D4] shrink-0" />
                <span className="text-white font-bold text-sm">
                  Everything in SurfBloom, plus:
                </span>
              </div>
              {[
                "Autonomous workflow execution",
                "AI builds, adjusts, and runs marketing",
                "White-glove onboarding",
                "Dedicated infrastructure",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-[#FFD54F] shrink-0 mt-0.5"
                  />
                  <span className="text-white/90 font-medium text-sm">
                    {feature}
                  </span>
                </div>
              ))}
              <div className="flex items-start gap-2 pt-1">
                <ArrowRight
                  size={16}
                  className="text-[#FF6F61] shrink-0 mt-0.5"
                />
                <span className="text-white font-semibold text-sm">
                  You set the goals.{" "}
                  <span className="text-[#FF6F61]">Maui does the rest.</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              className="relative z-10 w-full bg-gradient-to-r from-[#FFD54F] to-[#FFA000] hover:from-[#FFA000] hover:to-[#FF8F00] text-[#00332A] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-base shadow-[0_10px_20px_rgba(255,213,79,0.25)] hover:shadow-[0_15px_30px_rgba(255,213,79,0.35)]"
              onClick={() => setIsModalOpen(true)}
            >
              <PhoneCall size={18} /> Book a Call
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 1: One Platform, A Lot of Ground Covered */}
      <section className="scroll-section relative py-20 px-6 md:px-12 max-w-4xl mx-auto text-center border-t border-[#00A5D4]/10">
        <h2 className="reveal-item sb-font-playfair text-3xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
          Workflows. AI. Reviews. Campaigns. Tasks. <br />
          <span className="sb-font-great-vibes italic text-[#00A5D4] font-normal pr-2">
            And that's the short list.
          </span>
        </h2>

        <div className="reveal-item space-y-4 text-[#004D40]/75 text-lg md:text-xl leading-relaxed mb-10">
          <p>
            None of these tools work in isolation — a review request that
            doesn't trigger a follow-up task is just a text. A CRM that doesn't
            connect to your campaigns is just a spreadsheet with better design.
          </p>
          <p>
            SurfBloom only works because everything is wired together. What your
            plan looks like depends on your business.
          </p>
          <p className="font-bold text-[#004D40]">
            Book a call and we'll figure out the right fit together.
          </p>
        </div>

        <div className="reveal-item">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 bg-[#00A5D4] hover:bg-[#007A9E] text-white font-bold py-4 px-10 rounded-full transition-all duration-300 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1"
            onClick={() => setIsModalOpen(true)}
          >
            Book a Call <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* IMMERSIVE SEND-OFF: Floating Island Style */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#00A5D4] to-[#004D40] px-12 py-40 my-24 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(0,77,64,0.3)]">
        {/* Fresh Unsplash Oceanic/Horizon Background */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1498623116890-37e912163d5d?auto=format&fit=crop&w=2000&q=80"
            alt="Beautiful tropical horizon"
            fill
            className="object-cover"
          />
        </div>

        {/* Warm Sun Glare */}
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-[#FFD54F]/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <div className="relative z-10 mx-auto max-w-4xl flex flex-col items-center text-center gap-8">
          <Waves size={48} className="text-[#F9F5E7]/80 mb-2" />
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#F9F5E7] font-bold drop-shadow-md">
            Ready for a new
            <span className="sb-font-great-vibes italic text-[#FFD54F] font-normal text-6xl md:text-9xl px-4 tracking-wide drop-shadow-lg block mt-2">
              horizon?
            </span>
          </h2>
          <p className="impact-text text-xl md:text-2xl text-[#F9F5E7]/90 font-medium max-w-2xl leading-relaxed drop-shadow-sm mb-6">
            Stop working in the weeds. Let the system run the daily grind so you
            can focus on where your business goes next.
          </p>

          <Link
            href="/book"
            className="impact-text inline-flex items-center justify-center gap-2 bg-[#FF6F61] hover:bg-[#D94E40] text-white font-bold py-4 px-12 rounded-full transition-all duration-300 text-lg shadow-[0_10px_30px_rgba(255,111,97,0.4)] hover:shadow-[0_15px_40px_rgba(255,111,97,0.5)] hover:scale-105"
          >
            Get Started <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <BookDemoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
