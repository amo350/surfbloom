"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  MessageSquare,
  Building,
  Clock,
  Workflow,
  ClipboardList,
  AlertTriangle,
  Star,
  CheckCircle2,
  Home,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function PropertyManagementPage() {
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
        {/* Background Image with Clean Architectural Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80"
            alt="Modern apartment building exterior with clean landscaping"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#F9F5E7]/85 mix-blend-soft-light"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F5E7] via-[#F9F5E7]/70 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto pt-32">
          <div className="hero-elem inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-[#00A5D4]/20 text-[#00A5D4] font-bold text-sm mb-8 shadow-sm">
            <Building size={18} className="text-[#00A5D4]" />
            <span className="tracking-wide uppercase text-[#004D40]">
              Solutions for Property Management
            </span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-7xl lg:text-8xl font-bold text-[#004D40] leading-[1.1] mb-8 tracking-tight">
            Manage the tenants, <br />
            not the{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              chaos.
            </span>
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/80 leading-relaxed max-w-3xl mx-auto font-medium">
            Between maintenance requests, lease renewals, and vacancy marketing,
            things slip. SurfBloom automates tenant communication, review
            collection, and team follow-ups so your properties run tighter with
            less manual work.
          </p>
        </div>
      </section>

      {/* SECTION 1: Workflows */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
              alt="Property manager relaxed at a desk in a leasing office"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Workflow Overlay on Monitor */}
            <div className="absolute top-[20%] right-[10%] w-[55%] bg-white/95 backdrop-blur-sm rounded-xl border border-[#00A5D4]/20 shadow-2xl overflow-hidden p-4 transform rotate-[2deg]">
              <div className="flex items-center gap-2 mb-4">
                <Workflow size={14} className="text-[#00A5D4]" />
                <span className="text-xs font-bold text-[#004D40]">
                  Lease Renewal Flow
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-full p-2 bg-[#FF6F61]/10 border border-[#FF6F61]/30 rounded-lg flex items-center gap-2 text-[10px] font-bold text-[#004D40]">
                  <Clock size={12} className="text-[#FF6F61]" /> 60 Days to
                  Expiration
                </div>
                <div className="w-0.5 h-3 bg-[#00A5D4]/30"></div>
                <div className="w-full p-2 bg-[#00A5D4]/10 border border-[#00A5D4]/30 rounded-lg flex items-center gap-2 text-[10px] font-bold text-[#004D40]">
                  <MessageSquare size={12} className="text-[#00A5D4]" /> Send
                  Renewal Offer Email
                </div>
                <div className="w-0.5 h-3 bg-[#00A5D4]/30"></div>
                <div className="w-full p-2 bg-[#004D40]/10 border border-[#004D40]/20 rounded-lg flex items-center gap-2 text-[10px] font-bold text-[#004D40]">
                  <CheckCircle2 size={12} className="text-[#004D40]" /> If No
                  Response (14 Days)
                </div>
                <div className="w-0.5 h-3 bg-[#00A5D4]/30"></div>
                <div className="w-full p-2 bg-[#FF6F61]/10 border border-[#FF6F61]/30 rounded-lg flex items-center gap-2 text-[10px] font-bold text-[#004D40]">
                  <MessageSquare size={12} className="text-[#FF6F61]" /> Send
                  SMS Reminder
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Automations you can{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
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
              Lease expires in 60 days — renewal reminder goes out, follow-up
              text two weeks later, task gets created for your team if they
              don't respond. New tenant moves in — welcome message, parking
              info, and a survey follow in sequence.
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
      </section>

      {/* SECTION 2: AI Chatbot */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            An AI receptionist that{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              never
            </span>{" "}
            clocks out
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Every missed call and after-hours message gets handled instantly.
              SurfBloom's AI chatbot responds to inquiries, answers common
              questions about availability and pricing, captures lead
              information, and books tours.
            </p>
            <p>
              It uses your property name, tone, and active listings. Your
              prospects think they're talking to your leasing office. You see
              the full conversation waiting for you in the morning.
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
        <div className="relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
              alt="Empty leasing office at night with soft lighting"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-[0.7]"
            />
            {/* Glowing AI Chat UI overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white/95 backdrop-blur-md rounded-[2rem] border border-[#00A5D4]/30 shadow-2xl overflow-hidden pb-2">
              <div className="bg-[#004D40] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative">
                  <Home className="text-white" size={20} />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#004D40]"></div>
                </div>
                <div>
                  <p className="font-bold text-white">Leasing AI</p>
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <Clock size={10} /> 8:45 PM (Office Closed)
                  </p>
                </div>
              </div>
              <div className="p-5 space-y-4 bg-[#F9F5E7]">
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  Do you have any 2-bedrooms available for move-in next month?
                </div>
                <div className="bg-[#00A5D4]/10 p-3 rounded-xl rounded-tr-none border border-[#00A5D4]/10 text-[#004D40] text-sm max-w-[85%] ml-auto shadow-sm">
                  Yes, we currently have two 2-bedroom floorplans available
                  starting at $1,850/mo. Would you like me to send you a link to
                  schedule a tour this week?
                </div>
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  Yes, I'm free Thursday afternoon.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMMERSIVE BREAK SECTION: Seamless Living */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#00A5D4] to-[#007A9E] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(0,165,212,0.25)]">
        {/* Clean Architectural / Resort Background */}
        <div className="absolute inset-0 opacity-30 mix-blend-color-burn pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=80"
            alt="Modern luxury property architecture"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#F9F5E7]/20 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#004D40] font-bold flex flex-col md:flex-row items-center justify-center">
            Seamless
            <span className="sb-font-great-vibes italic text-[#F9F5E7] font-normal text-6xl md:text-9xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-sm">
              Living.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7] font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            When communication is proactive and issues are solved instantly,
            tenants don't just stay — they bring their friends.
          </p>
        </div>
      </section>

      {/* SECTION 3: Surveys */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
              alt="Bright modern apartment interior"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Survey UI Overlay */}
            <div className="absolute bottom-[10%] left-[-5%] w-[110%] md:w-[85%] md:left-[7.5%] bg-white/95 backdrop-blur-md rounded-2xl border border-[#00A5D4]/20 shadow-xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-[#00A5D4]">
                  <ClipboardList size={18} />
                  <span className="font-bold text-sm">
                    Maintenance Follow-up
                  </span>
                </div>
                <span className="text-[10px] font-bold text-white bg-[#10B981] px-2 py-1 rounded-md shadow-sm">
                  SYNCED TO UNIT 4B
                </span>
              </div>
              <p className="text-[#004D40] font-semibold text-sm">
                How satisfied were you with your recent repair?
              </p>
              <div className="flex justify-between items-center bg-[#F9F5E7] p-2 rounded-xl border border-[#00A5D4]/10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <div
                    key={num}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${num === 10 ? "bg-[#00A5D4] text-white shadow-md scale-110" : "bg-white text-[#004D40]/50 border border-gray-200"}`}
                  >
                    {num}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#004D40]/60 italic border-l-2 border-[#00A5D4]/30 pl-2">
                "Carlos was great. Fixed the AC in under 20 minutes and left the
                place perfectly clean."
              </p>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Know what your tenants{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              actually
            </span>{" "}
            think
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Send short surveys after move-in, maintenance completion, or lease
              renewal to catch problems before they become vacancies. Responses
              flow straight into your CRM — tied to the tenant, not floating in
              a spreadsheet.
            </p>
            <p>
              Low score? A workflow can automatically create a follow-up task
              for your team to reach out and make it right. Track satisfaction
              trends across properties and spot issues before they cost you
              renewals.
            </p>
            <Link
              href="/product/surveys"
              className="inline-flex items-center gap-2 font-bold text-[#00A5D4] hover:text-[#FF6F61] transition-colors mt-4 group"
            >
              Learn more about Surveys{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: Feedback */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Catch bad experiences before they go{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              public
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Not every unhappy tenant leaves a review — most just don't renew.
              SurfBloom's feedback system gives them a private channel to tell
              you what went wrong before they tell Google or Yelp.
            </p>
            <p>
              Slow maintenance response, noisy neighbor, billing confusion — you
              hear about it first. Negative feedback triggers a workflow — task
              created, team notified, follow-up sent — so you can fix the
              problem while the tenant still lives there.
            </p>
            <Link
              href="/product/feedback"
              className="inline-flex items-center gap-2 font-bold text-[#00A5D4] hover:text-[#FF6F61] transition-colors mt-4 group"
            >
              Learn more about Feedback{" "}
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
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"
              alt="Maintenance worker and property manager in apartment hallway"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 filter contrast-125 saturate-50"
            />
            {/* Feedback Intercept Overlay */}
            <div className="absolute bottom-[15%] right-[10%] w-[75%] bg-white/95 backdrop-blur-md rounded-2xl border-l-4 border-[#FF6F61] shadow-2xl p-4">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-[#FF6F61]" />
                  <p className="text-xs font-bold text-[#004D40] uppercase tracking-wider">
                    Private Feedback Captured
                  </p>
                </div>
                <p className="text-[10px] text-[#004D40]/50 font-bold">
                  JUST NOW
                </p>
              </div>

              <div className="flex gap-1 mb-2">
                <Star size={14} className="text-[#FF6F61] fill-[#FF6F61]" />
                <Star size={14} className="text-[#FF6F61] fill-[#FF6F61]" />
                <Star size={14} className="text-gray-300" />
                <Star size={14} className="text-gray-300" />
                <Star size={14} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-[#004D40] mb-1">
                Unit 214 (Move-in Survey)
              </p>
              <p className="text-xs text-[#004D40]/70 italic border-l-2 border-gray-200 pl-2">
                "Overall the apartment is nice, but the master bedroom window
                blind is completely broken and won't close."
              </p>
              <div className="mt-3 flex gap-2">
                <div className="text-[10px] font-bold text-white bg-[#004D40] px-2 py-1 rounded">
                  Maint. Task Created
                </div>
                <div className="text-[10px] font-bold text-[#004D40] bg-[#F9F5E7] px-2 py-1 rounded border border-[#004D40]/10">
                  Auto-Apology Sent
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
