"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Mail,
  QrCode,
  Send,
  Smartphone,
  Tag,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function CampaignsPage() {
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

      // Immersive break section text reveal (Updated for new content)
      gsap.from(".impact-text", {
        scrollTrigger: {
          trigger: ".impact-section",
          start: "top 70%",
        },
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1.2,
        ease: "power3.out",
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
      {/* TEXT-ONLY HERO SECTION (Updated Background Image) */}
      <section className="relative min-h-[75vh] flex flex-col justify-center items-center text-center px-6 md:px-12 overflow-hidden bg-[#F9F5E7]">
        {/* Layer 1: Sun-drenched Palm Shadows (Brighter & More Defined) */}
        <div
          className="absolute inset-0 z-0 opacity-[0.1] mix-blend-multiply pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: "url('image_0.png')" }}
        />

        {/* Layer 2: Modern Grid Fade (Unchanged) */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#004D401A_1px,transparent_1px),linear-gradient(to_bottom,#004D401A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto pt-40 md:pt-48 pb-20">
          <div className="hero-elem inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-[#00A5D4]/20 text-[#00A5D4] font-bold text-sm mb-10 shadow-sm">
            <Send size={18} />
            <span className="tracking-wide uppercase">Marketing Campaigns</span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-8xl font-bold text-[#004D40] leading-[1.05] mb-8 tracking-tight drop-shadow-sm">
            One message at the right time beats{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              ten
            </span>{" "}
            at the wrong one.
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/75 leading-relaxed max-w-4xl mx-auto font-medium">
            Build drip sequences, one-time blasts, or ongoing nurture campaigns
            — all from one place. Target by tag, status, or any field in your
            CRM. Schedule it, send it, and see exactly who opened, clicked, and
            replied.
          </p>
        </div>
      </section>

      {/* SECTION 1: Drip Sequences (Unchanged) */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative flex justify-center">
          {/* Stunning CSS Mockup of the Drip Sequence Builder */}
          <div className="reveal-item float-ui w-full max-w-lg bg-white rounded-[2.5rem] border border-[#00A5D4]/20 shadow-[0_30px_60px_rgba(0,77,64,0.1)] overflow-hidden relative">
            {/* App UI Header (Matching your screenshots) */}
            <div className="bg-[#F9F5E7]/50 border-b border-[#00A5D4]/10 px-6 pt-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-[#004D40] text-xl">
                  New Lead Welcome
                </h3>
                <div className="bg-[#10B981]/10 text-[#10B981] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></div>{" "}
                  Active
                </div>
              </div>
              {/* App Tabs matching screenshot */}
              <div className="flex gap-6 text-sm font-semibold text-[#004D40]/50 border-b border-transparent">
                <span className="pb-3">Settings</span>
                <span className="pb-3 border-b-2 border-[#00A5D4] text-[#00A5D4]">
                  Sequence
                </span>
                <span className="pb-3">Reporting</span>
              </div>
            </div>

            {/* Sequence Timeline */}
            <div className="p-8 relative">
              {/* Connecting Line */}
              <div className="absolute left-[3.15rem] top-10 bottom-10 w-0.5 bg-[#00A5D4]/20"></div>

              {/* Step 1 */}
              <div className="flex gap-5 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#00A5D4] flex items-center justify-center shrink-0 shadow-sm text-[#00A5D4]">
                  <Smartphone size={20} />
                </div>
                <div className="flex-grow bg-[#F9F5E7]/50 p-4 rounded-2xl border border-[#00A5D4]/10">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-[#004D40]/50 uppercase tracking-wider flex items-center gap-1">
                      <Clock size={12} /> Send Immediately
                    </p>
                  </div>
                  <h4 className="font-bold text-[#004D40] text-sm mb-1">
                    Welcome Text
                  </h4>
                  <div className="flex gap-3 mt-3 pt-3 border-t border-[#00A5D4]/10 text-[10px] font-bold text-[#004D40]/60">
                    <span>98% SENT</span>
                    <span>42% REPLIED</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-5 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#00A5D4] flex items-center justify-center shrink-0 shadow-sm text-[#00A5D4]">
                  <Mail size={20} />
                </div>
                <div className="flex-grow bg-[#F9F5E7]/50 p-4 rounded-2xl border border-[#00A5D4]/10">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-[#004D40] uppercase tracking-wider flex items-center gap-1 bg-[#00A5D4]/10 px-2 py-0.5 rounded-md">
                      <Clock size={12} /> Delay: 3 Days
                    </p>
                  </div>
                  <h4 className="font-bold text-[#004D40] text-sm mb-1">
                    Brand Introduction Email
                  </h4>
                  <div className="flex gap-3 mt-3 pt-3 border-t border-[#00A5D4]/10 text-[10px] font-bold text-[#004D40]/60">
                    <span>95% SENT</span>
                    <span>68% OPENED</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-5 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#FF6F61] flex items-center justify-center shrink-0 shadow-sm text-[#FF6F61]">
                  <Smartphone size={20} />
                </div>
                <div className="flex-grow bg-[#F9F5E7]/50 p-4 rounded-2xl border border-[#00A5D4]/10">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-[#FF6F61] uppercase tracking-wider flex items-center gap-1 bg-[#FF6F61]/10 px-2 py-0.5 rounded-md">
                      <Clock size={12} /> Delay: 14 Days
                    </p>
                  </div>
                  <h4 className="font-bold text-[#004D40] text-sm mb-1">
                    Special Offer Push
                  </h4>
                  <div className="flex gap-3 mt-3 pt-3 border-t border-[#00A5D4]/10 text-[10px] font-bold text-[#004D40]/60">
                    <span>-- PENDING --</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Set it once, nurture{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              forever
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Not every client is ready to book today. Drip sequences let you
              stay in front of them until they are.
            </p>
            <p>
              New lead comes in — welcome text goes out immediately, a follow-up
              three days later, another at two weeks with a special offer. Every
              message is timed, personalized, and automatic.
            </p>
            <p className="font-semibold text-[#004D40]">
              You build the sequence once and every new contact that opts in and
              matches your criteria enters it without you lifting a finger.
              Pause, edit, or extend the sequence anytime without breaking
              what's already running.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Targeting (Unchanged) */}
      <section className="scroll-section relative py-32 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Send to the right people, not{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              everyone
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              A campaign is only as good as who receives it. Filter your contact
              list by any combination of tags, status, source, category, or
              custom fields.
            </p>
            <p>
              Re-engage clients you haven't seen in 90 days. Push a promo only
              to contacts tagged "VIP." Send a review request sequence only to
              contacts marked "visited" in the last week.
            </p>
            <div className="p-6 rounded-3xl bg-white border border-[#00A5D4]/15 shadow-sm text-left relative overflow-hidden mt-8">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00A5D4]"></div>
              <p className="font-semibold text-[#004D40]">
                Build the audience once and save it as a segment you can reuse.
                No more exporting CSVs and guessing who should get what.
              </p>
            </div>
          </div>
        </div>

        {/* Audience Builder Mockup */}
        <div className="reveal-item relative flex justify-center">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-[#00A5D4]/20 shadow-[0_30px_60px_rgba(0,77,64,0.15)] p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#00A5D4]/10 flex items-center justify-center">
                <Filter className="text-[#00A5D4]" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[#004D40] text-lg">
                  Audience Builder
                </h3>
                <p className="text-xs text-[#004D40]/50 font-bold uppercase tracking-wider">
                  Create Segment
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {/* Filter Row 1 */}
              <div className="flex items-center gap-3 bg-[#F9F5E7] border border-[#004D40]/10 p-3 rounded-xl">
                <Tag size={16} className="text-[#FF6F61]" />
                <span className="text-sm font-semibold text-[#004D40]">
                  Tag
                </span>
                <span className="text-xs font-mono text-[#004D40]/40">
                  EQUALS
                </span>
                <span className="text-sm font-bold bg-white px-2 py-1 rounded shadow-sm border border-[#004D40]/5 text-[#004D40]">
                  VIP
                </span>
              </div>

              <div className="w-0.5 h-3 bg-[#004D40]/20 ml-8"></div>
              <div className="text-xs font-bold text-[#00A5D4] ml-6 tracking-widest">
                AND
              </div>
              <div className="w-0.5 h-3 bg-[#004D40]/20 ml-8"></div>

              {/* Filter Row 2 */}
              <div className="flex items-center gap-3 bg-[#F9F5E7] border border-[#004D40]/10 p-3 rounded-xl">
                <Clock size={16} className="text-[#00A5D4]" />
                <span className="text-sm font-semibold text-[#004D40]">
                  Last Visit
                </span>
                <span className="text-xs font-mono text-[#004D40]/40">
                  {">"} THAN
                </span>
                <span className="text-sm font-bold bg-white px-2 py-1 rounded shadow-sm border border-[#004D40]/5 text-[#004D40]">
                  90 Days
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#00A5D4] to-[#007A9E] rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
              <Users size={24} className="mx-auto mb-2 opacity-80" />
              <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">
                Audience Size
              </p>
              <p className="text-4xl font-bold tracking-tight">1,248</p>
              <p className="text-xs opacity-70 mt-2">
                Contacts matching criteria
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW IMMERSIVE BREAK SECTION: Marketing Momentum (Yellow & Bright) */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#FFD54F] to-[#FFB300] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(255,179,0,0.3)]">
        {/* Abstract Yellow/Orange Flow Background */}
        <div
          className="absolute inset-0 z-0 opacity-[0.2] mix-blend-overlay pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: "url('image_1.png')" }}
        />
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-[#F9F5E7]/20 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#004D40] font-bold flex flex-col md:flex-row items-center justify-center">
            Marketing
            <span className="sb-font-great-vibes italic text-[#F9F5E7] font-normal text-6xl md:text-9xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-sm">
              Momentum.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#004D40]/90 font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            When every message hits the mark, your community becomes your most
            loyal asset. Don't wait for luck—build your own inevitability.
          </p>
        </div>
      </section>

      {/* SECTION 3: QR Codes (Unchanged) */}
      <section className="scroll-section relative py-32 px-6 md:px-12 max-w-7xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative h-[500px] flex items-center justify-center">
          {/* Abstract QR Code to Campaign visualization */}
          <div className="absolute inset-0 bg-[#FF6F61]/5 rounded-[3rem] border border-[#FF6F61]/10"></div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* The Trigger (Physical QR Scan) */}
            <div className="bg-white p-5 rounded-[2rem] shadow-xl border border-[#00A5D4]/10 flex flex-col items-center gap-3 w-48 transform -translate-x-16 rotate-[-4deg] relative z-20">
              <div className="w-full aspect-square bg-[#F9F5E7] rounded-xl flex items-center justify-center border border-[#004D40]/5 relative overflow-hidden">
                <QrCode size={64} className="text-[#004D40]" />
                {/* Scanning line animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#FF6F61] shadow-[0_0_10px_#FF6F61] animate-[scan_2s_ease-in-out_infinite]"></div>
              </div>
              <p className="text-xs font-bold text-[#004D40] text-center">
                Table Tent Promo
              </p>
            </div>

            {/* Connecting Flow Arrow */}
            <div className="w-1 h-12 bg-gradient-to-b from-[#004D40]/20 to-[#00A5D4] rounded-full absolute top-[35%] right-[45%] transform rotate-[-45deg] z-10"></div>

            {/* The Automation Step */}
            <div className="bg-[#00A5D4] text-white p-4 rounded-2xl shadow-lg border border-[#00A5D4] flex items-center gap-4 w-64 transform translate-x-12 z-20">
              <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">
                  Automated
                </p>
                <p className="text-sm font-bold">Contact Created & Tagged</p>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="w-1 h-8 bg-gradient-to-b from-[#00A5D4] to-[#10B981] rounded-full transform translate-x-12"></div>

            {/* The Result */}
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-[#10B981]/30 flex items-center gap-4 w-72 transform translate-x-16 relative overflow-hidden z-20">
              <div className="absolute left-0 top-0 w-1.5 h-full bg-[#10B981]"></div>
              <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} className="text-[#10B981]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#004D40]">
                  Welcome Campaign Started
                </p>
                <p className="text-xs text-[#004D40]/50 mt-0.5">
                  First message sent instantly
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Turn foot traffic into contacts{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              automatically
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Every QR code you create in SurfBloom links directly to a
              campaign. Print it on a table tent, a receipt, a yard sign, or a
              business card.
            </p>
            <p>
              Client scans it, enters their info, and they're instantly a
              contact in your CRM — tagged, segmented, and enrolled in whatever
              sequence you've built. No manual entry, no "I'll add them later."
            </p>
            <p className="font-semibold text-[#004D40]">
              The scan is the opt-in, the campaign starts immediately, and you
              know exactly which QR code brought them in. Track scans by
              location, date, and source so you know which placements actually
              work.
            </p>
          </div>
        </div>
      </section>

      {/* Global Animation Styles for the Mockups */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `,
        }}
      />
    </div>
  );
}
