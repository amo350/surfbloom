"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  MessageSquare,
  Package,
  Send,
  ShieldCheck,
  Smartphone,
  Star,
  User,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function StoragePage() {
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

      // Immersive break section text reveal
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
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center px-6 md:px-12 overflow-hidden">
        {/* Background Image with Clean Structural Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="https://images.pexels.com/photos/4481258/pexels-photo-4481258.jpeg?auto=compress&cs=tinysrgb&w=2000"
            alt="Clean modern self-storage facility corridor"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#F9F5E7]/85 mix-blend-soft-light"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F5E7] via-[#F9F5E7]/70 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto pt-32">
          <div className="hero-elem inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-[#00A5D4]/20 text-[#00A5D4] font-bold text-sm mb-8 shadow-sm">
            <Package size={18} className="text-[#00A5D4]" />
            <span className="tracking-wide uppercase text-[#004D40]">
              Solutions for Self-Storage
            </span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-7xl lg:text-8xl font-bold text-[#004D40] leading-[1.1] mb-8 tracking-tight">
            Fill more units without hiring{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              more
            </span>{" "}
            staff.
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/80 leading-relaxed max-w-3xl mx-auto font-medium">
            Most storage facilities lose leads to the competitor that responded
            first. SurfBloom automates your inquiry follow-ups, review requests,
            and tenant communication so empty units don't stay empty because
            someone forgot to call back.
          </p>
        </div>
      </section>

      {/* SECTION 1: AI Chatbot */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
              alt="Empty storage office at night with glowing monitors"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-[0.7]"
            />
            {/* Glowing AI Chat UI overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] bg-white/95 backdrop-blur-md rounded-3xl border border-[#00A5D4]/30 shadow-2xl overflow-hidden pb-2">
              <div className="bg-[#004D40] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative">
                  <ShieldCheck className="text-white" size={20} />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#004D40]"></div>
                </div>
                <div>
                  <p className="font-bold text-white">Facility Assistant</p>
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <Clock size={10} /> 10:15 PM (Office Closed)
                  </p>
                </div>
              </div>
              <div className="p-5 space-y-4 bg-[#F9F5E7]">
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  Do you guys offer 10x10 climate-controlled units?
                </div>
                <div className="bg-[#00A5D4]/10 p-3 rounded-xl rounded-tr-none border border-[#00A5D4]/10 text-[#004D40] text-sm max-w-[90%] ml-auto shadow-sm">
                  Yes, we offer 10x10 climate-controlled units! They generally
                  start around $120/mo. Would you like me to send you a secure
                  link to check current availability and reserve your unit
                  online? 📦
                </div>
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  Yes, send me the link please!
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            An AI receptionist that{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              never
            </span>{" "}
            clocks out
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Every missed call and after-hours message gets handled instantly.
              SurfBloom's AI chatbot responds to inquiries, answers common
              questions about unit sizes and features, and routes prospects
              directly to your reservation flow.
            </p>
            <p>
              It responds using your facility name and tone without guessing at
              exact inventory. Your prospects get immediate help and a clear
              next step, and you see the full conversation waiting for you in
              the morning.
            </p>
            <Link
              href="/product/conversations"
              className="inline-flex items-center gap-2 font-bold text-[#00A5D4] hover:text-[#FF6F61] transition-colors mt-4 group"
            >
              Learn more about AI Chatbot{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: Conversations */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Every text and message in{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              one inbox
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Stop checking three apps to see who reached out. SurfBloom pulls
              all your tenant and prospect conversations into a single inbox —
              SMS, webchat, and more in one thread per contact.
            </p>
            <p>
              Your team can see the full history, pick up where someone left
              off, and respond without asking "did we already get back to them?"
              Every conversation links to the contact record so context is never
              missing.
            </p>
            <Link
              href="/product/conversations"
              className="inline-flex items-center gap-2 font-bold text-[#00A5D4] hover:text-[#FF6F61] transition-colors mt-4 group"
            >
              Learn more about Conversations{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
        <div className="relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
              alt="Manager leaning on the front counter texting"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Unified Inbox Overlay */}
            <div className="absolute bottom-[10%] left-[5%] w-[90%] md:w-[85%] bg-white/95 backdrop-blur-md rounded-[2rem] border border-[#00A5D4]/10 shadow-2xl overflow-hidden flex">
              {/* Left Sidebar */}
              <div className="w-1/3 border-r border-[#00A5D4]/10 bg-[#F9F5E7]/50 flex flex-col">
                <div className="p-3 border-b border-[#00A5D4]/10">
                  <p className="text-[10px] font-bold text-[#004D40] uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare size={12} /> Inbox
                  </p>
                </div>
                <div className="p-3 bg-white border-l-2 border-[#FF6F61]">
                  <p className="text-xs font-bold text-[#004D40] truncate">
                    Unit 402 - J. Smith
                  </p>
                  <p className="text-[10px] text-[#004D40]/60 truncate">
                    What are your gate hours?
                  </p>
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-[#004D40] truncate">
                    New Lead (Web)
                  </p>
                  <p className="text-[10px] text-[#004D40]/60 truncate">
                    Send me the link to reserve...
                  </p>
                </div>
              </div>
              {/* Right Side */}
              <div className="w-2/3 p-4 flex flex-col justify-between bg-white">
                <div className="space-y-3 mb-4">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#004D40]/10 flex items-center justify-center shrink-0">
                      <User size={10} className="text-[#004D40]" />
                    </div>
                    <p className="bg-[#F9F5E7] p-2 rounded-xl rounded-tl-none text-[10px] text-[#004D40] leading-snug">
                      Hi, what are the gate hours this weekend for the holiday?
                    </p>
                  </div>
                  <div className="flex gap-2 flex-row-reverse">
                    <p className="bg-[#00A5D4] p-2 rounded-xl rounded-tr-none text-[10px] text-white leading-snug">
                      Hey James! The gate hours remain normal (6 AM - 10 PM) all
                      weekend. Enjoy the holiday! 🎇
                    </p>
                  </div>
                </div>
                {/* Input field */}
                <div className="bg-[#F9F5E7] rounded-full p-1.5 pl-3 flex items-center justify-between border border-[#00A5D4]/10">
                  <span className="text-[10px] text-[#004D40]/40">
                    Type a message...
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#00A5D4] flex items-center justify-center">
                    <Send size={10} className="text-white ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMMERSIVE BREAK SECTION: Set and Forget */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#00A5D4] to-[#004D40] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(0,77,64,0.3)]">
        {/* Secure Sunset Architecture Background */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=2000&q=80"
            alt="Clean architectural cityscape at sunset"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-[#F9F5E7]/20 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#F9F5E7] font-bold flex flex-col md:flex-row items-center justify-center">
            Set it and
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal text-6xl md:text-9xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-sm">
              forget it.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7]/90 font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            Self-storage is meant to be passive income. Make sure your
            facility's marketing and communication are just as hands-off.
          </p>
        </div>
      </section>

      {/* SECTION 3: Review Collection */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Customer moving boxes into a clean storage unit"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Floating Notification UI overlay */}
            <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md p-5 rounded-[2rem] border border-[#00A5D4]/20 shadow-lg max-w-xs animate-pulse-slow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FF6F61]/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Star className="text-[#FF6F61] fill-[#FF6F61]" size={20} />
                </div>
                <div>
                  <p className="font-bold text-[#004D40] text-[15px]">
                    SafeSpace Storage
                  </p>
                  <p className="text-[#004D40]/70 text-xs leading-relaxed mt-1">
                    Hi Sarah! Thanks for choosing SafeSpace today. Was your
                    move-in experience smooth? We'd love a quick Google review!
                  </p>
                  <p className="text-[#00A5D4] text-xs font-semibold mt-2">
                    review.link/safespace
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            More five-star reviews on{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              autopilot
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              The facilities with the most reviews win local search. When a
              tenant opts into your messaging, a workflow handles the rest — a
              personalized text goes out after move-in with a direct link to
              your Google review page.
            </p>
            <p>
              AI writes the message using the tenant's name and move-in details
              so it reads like a personal follow-up, not a mass blast. Didn't
              leave a review after five days? A gentle nudge goes out
              automatically. Left one? A thank-you message fires.
            </p>
            <Link
              href="/product/reviews"
              className="inline-flex items-center gap-2 font-bold text-[#00A5D4] hover:text-[#FF6F61] transition-colors mt-4 group"
            >
              Learn more about Reviews{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: Workflows */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Automations you can{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              see
            </span>{" "}
            working
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Build visual workflows that handle your repetitive communication
              automatically. Drag triggers and actions onto a canvas, connect
              them, and let them run.
            </p>
            <p>
              New tenant signs a lease — welcome text goes out, facility rules
              follow the next morning, review request fires a week later. Lease
              coming up for renewal — reminder goes out at 30 days, follow-up at
              14.
            </p>
            <p className="font-semibold text-[#004D40]">
              You see every step on a visual tree, not buried in settings. No
              code, no guesswork.
            </p>
            <Link
              href="/product/workflows"
              className="inline-flex items-center gap-2 font-bold text-[#00A5D4] hover:text-[#FF6F61] transition-colors mt-4 group"
            >
              Learn more about Workflows{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
        <div className="relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=1200&q=80"
              alt="Aerial view of a logistics or self-storage facility"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Workflow Overlay */}
            <div className="absolute top-[20%] right-[10%] w-[50%] bg-white/95 backdrop-blur-sm rounded-[2rem] border border-[#00A5D4]/20 shadow-2xl overflow-hidden p-4 transform rotate-[2deg]">
              <div className="flex items-center gap-2 mb-4">
                <Workflow size={14} className="text-[#00A5D4]" />
                <span className="text-xs font-bold text-[#004D40]">
                  Move-In Flow
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-full p-2 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg flex items-center gap-2 text-[10px] font-bold text-[#004D40]">
                  <CheckCircle2 size={12} className="text-[#10B981]" /> Lease
                  Signed
                </div>
                <div className="w-0.5 h-3 bg-[#00A5D4]/30"></div>
                <div className="w-full p-2 bg-[#00A5D4]/10 border border-[#00A5D4]/30 rounded-lg flex items-center gap-2 text-[10px] font-bold text-[#004D40]">
                  <Lock size={12} className="text-[#00A5D4]" /> Text Gate Code
                </div>
                <div className="w-0.5 h-3 bg-[#00A5D4]/30"></div>
                <div className="w-full p-2 bg-[#004D40]/10 border border-[#004D40]/20 rounded-lg flex items-center gap-2 text-[10px] font-bold text-[#004D40]">
                  <Clock size={12} className="text-[#004D40]" /> Wait 7 Days
                </div>
                <div className="w-0.5 h-3 bg-[#00A5D4]/30"></div>
                <div className="w-full p-2 bg-[#FF6F61]/10 border border-[#FF6F61]/30 rounded-lg flex items-center gap-2 text-[10px] font-bold text-[#004D40]">
                  <Star size={12} className="text-[#FF6F61]" /> Request Google
                  Review
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
