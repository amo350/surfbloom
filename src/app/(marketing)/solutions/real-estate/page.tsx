"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  MessageSquare,
  Send,
  UserCircle,
  MessageCircle,
  Sparkles,
  Home,
  Clock,
  Mail,
  Smartphone,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function RealEstatePage() {
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
        {/* Background Image with Warm Golden Hour Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2000&q=80"
            alt="Real estate agent shaking hands at a modern home"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#F9F5E7]/85 mix-blend-soft-light"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F5E7] via-[#F9F5E7]/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto pt-32">
          <div className="hero-elem inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-[#00A5D4]/20 text-[#00A5D4] font-bold text-sm mb-8 shadow-sm">
            <Home size={18} className="text-[#FF6F61]" />
            <span className="tracking-wide uppercase text-[#004D40]">
              Solutions for Real Estate
            </span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-7xl lg:text-8xl font-bold text-[#004D40] leading-[1.1] mb-8 tracking-tight">
            Close more deals by following up{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              less
            </span>{" "}
            manually.
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/80 leading-relaxed max-w-3xl mx-auto font-medium">
            Leads go cold fast. SurfBloom automates your follow-ups, nurture
            sequences, and review requests so no prospect slips through while
            you're showing houses.
          </p>
        </div>
      </section>

      {/* SECTION 1: AI Chatbot */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
              alt="Moody staged living room at night"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-[0.7]"
            />
            {/* Floating Mobile Phone Chat UI overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] border-[6px] border-[#004D40] shadow-2xl overflow-hidden pb-4">
              <div className="bg-[#F9F5E7] p-4 text-center border-b border-[#00A5D4]/10">
                <p className="font-bold text-[#004D40] text-sm">Agent AI</p>
                <p className="text-[#00A5D4] text-[10px] font-bold uppercase tracking-wider">
                  Online
                </p>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-[#004D40]/5 p-3 rounded-2xl rounded-tl-none text-[#004D40] text-xs max-w-[85%]">
                  Hi! Is the property on Oak Street still available?
                </div>
                <div className="bg-[#00A5D4] p-3 rounded-2xl rounded-tr-none text-white text-xs max-w-[85%] ml-auto">
                  Yes, 142 Oak Street is still actively listed! Would you like
                  to schedule a private showing for tomorrow afternoon?
                </div>
                <div className="bg-[#004D40]/5 p-3 rounded-2xl rounded-tl-none text-[#004D40] text-xs max-w-[85%]">
                  That would be great. 3 PM?
                </div>
                <div className="bg-[#00A5D4] p-3 rounded-2xl rounded-tr-none text-white text-xs max-w-[85%] ml-auto">
                  Perfect. I've locked in 3:00 PM tomorrow. I'll text you the
                  calendar invite now! 🏡
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
              questions, captures lead information, and books showings — all
              using your name, tone, and listings.
            </p>
            <p>
              Your prospects think they're talking to you. You see the full
              conversation waiting for you in the morning.
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

      {/* IMMERSIVE BREAK SECTION: Golden Hour Theme */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#FF8A7A] to-[#E65C4F] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(255,111,97,0.3)]">
        {/* Golden Hour Neighborhood Background */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1515263487965-5c40d9531cfb?auto=format&fit=crop&w=2000&q=80"
            alt="Golden hour neighborhood sunset"
            fill
            className="object-cover"
          />
        </div>
        {/* Warm Glare Effect representing the closing moment */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#F9F5E7]/30 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#004D40] font-bold flex flex-col md:flex-row items-center justify-center">
            The power of
            <span className="sb-font-great-vibes italic text-[#F9F5E7] font-normal text-6xl md:text-8xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-sm">
              perfect timing.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7] font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            In real estate, five minutes is the difference between a new client
            and a missed opportunity. Be the agent who always responds first.
          </p>
        </div>
      </section>

      {/* SECTION 2: Campaigns */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Send the right message at the right{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              time
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Build drip sequences, one-time blasts, or ongoing nurture
              campaigns — all from one place. Text, email, or both. Target by
              tag, status, or any custom field in your CRM.
            </p>
            <p>
              Send a market update to past buyers, automate a welcome series for
              new leads, or re-engage prospects that went quiet six months ago.
              Every send is tracked so you know what landed and what didn't.
            </p>
            <Link
              href="/product/campaigns"
              className="inline-flex items-center gap-2 font-bold text-[#00A5D4] hover:text-[#FF6F61] transition-colors mt-4 group"
            >
              Learn more about Campaigns{" "}
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
              src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80"
              alt="Real estate agent working in a bright coffee shop"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Campaign Sequence Overlay */}
            <div className="absolute bottom-[10%] left-[-5%] w-[110%] md:w-[80%] md:left-[10%] bg-white/95 backdrop-blur-md rounded-2xl border border-[#00A5D4]/20 shadow-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-3 bg-[#F9F5E7] p-3 rounded-xl border border-[#00A5D4]/10">
                <Mail className="text-[#00A5D4]" size={16} />
                <div className="flex-grow">
                  <p className="text-xs font-bold text-[#004D40]">
                    Welcome Email
                  </p>
                  <p className="text-[10px] text-[#004D40]/60">
                    Sent immediately
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full">
                  68% Open
                </div>
              </div>
              <div className="flex justify-center -my-1 z-10">
                <div className="bg-[#FF6F61] text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Clock size={8} /> Wait 2 Days
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#F9F5E7] p-3 rounded-xl border border-[#00A5D4]/10">
                <Smartphone className="text-[#FF6F61]" size={16} />
                <div className="flex-grow">
                  <p className="text-xs font-bold text-[#004D40]">
                    Market Update SMS
                  </p>
                  <p className="text-[10px] text-[#004D40]/60">
                    Checking in on their timeline
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#00A5D4] bg-[#00A5D4]/10 px-2 py-1 rounded-full">
                  Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CRM */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80"
              alt="Wall of client photos and thank you cards"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Contact Record Overlay */}
            <div className="absolute top-[15%] right-[10%] w-[60%] bg-white/95 backdrop-blur-sm rounded-2xl border border-[#004D40]/10 shadow-2xl p-5">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#00A5D4]/10">
                <div className="w-12 h-12 bg-[#00A5D4]/10 rounded-full flex items-center justify-center text-[#00A5D4] font-bold text-lg">
                  MJ
                </div>
                <div>
                  <p className="font-bold text-[#004D40]">Michael & Jessica</p>
                  <p className="text-xs text-[#004D40]/60">First-time Buyers</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] font-bold bg-[#FF8A7A]/10 text-[#FF8A7A] px-2 py-1 rounded-md">
                  Hot Lead
                </span>
                <span className="text-[10px] font-bold bg-[#F9F5E7] text-[#004D40]/70 border border-[#004D40]/10 px-2 py-1 rounded-md">
                  Pre-approved
                </span>
                <span className="text-[10px] font-bold bg-[#F9F5E7] text-[#004D40]/70 border border-[#004D40]/10 px-2 py-1 rounded-md">
                  $400k - $500k
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#004D40]/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00A5D4]"></div>{" "}
                  Viewed 142 Oak St.
                </div>
                <div className="flex items-center gap-2 text-xs text-[#004D40]/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6F61]"></div>{" "}
                  Replied to Market Update SMS
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Every client. Every interaction.{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              One record.
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              SurfBloom's CRM isn't a standalone address book — it's the
              backbone everything else connects to. Every text, review, survey
              response, task, and workflow execution ties back to a single
              contact record.
            </p>
            <p>
              Import your existing list, capture new leads from web forms and QR
              codes, and tag contacts however makes sense for your business.
              When you open a contact, you see their entire history — not just a
              name and phone number.
            </p>
            <Link
              href="/product/contacts"
              className="inline-flex items-center gap-2 font-bold text-[#00A5D4] hover:text-[#FF6F61] transition-colors mt-4 group"
            >
              Learn more about Contacts{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: Conversations */}
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
              Stop checking three apps to see who messaged you. SurfBloom pulls
              all your client conversations into a single inbox — SMS, webchat,
              and more in one thread per contact.
            </p>
            <p>
              Your whole team can see the history, pick up where someone left
              off, and respond without asking "did anyone already text them
              back?" Every conversation links to the contact record so context
              is never missing.
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
              src="https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&w=1200&q=80"
              alt="Real estate agent texting while walking"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Unified Inbox Overlay */}
            <div className="absolute bottom-[15%] left-[10%] w-[80%] bg-white/95 backdrop-blur-md rounded-2xl border border-[#004D40]/10 shadow-2xl overflow-hidden flex">
              {/* Left Sidebar (Contacts) */}
              <div className="w-1/3 border-r border-[#00A5D4]/10 bg-[#F9F5E7]/50 flex flex-col">
                <div className="p-3 border-b border-[#00A5D4]/10">
                  <p className="text-[10px] font-bold text-[#004D40] uppercase tracking-wider">
                    Inbox
                  </p>
                </div>
                <div className="p-3 bg-white border-l-2 border-[#FF6F61]">
                  <p className="text-xs font-bold text-[#004D40] truncate">
                    Sarah Davis
                  </p>
                  <p className="text-[10px] text-[#004D40]/60 truncate">
                    Can we see the house...
                  </p>
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-[#004D40] truncate">
                    Tom C.
                  </p>
                  <p className="text-[10px] text-[#004D40]/60 truncate">
                    Thanks for the update!
                  </p>
                </div>
              </div>
              {/* Right Side (Chat) */}
              <div className="w-2/3 p-4 flex flex-col justify-between bg-white">
                <div className="space-y-3 mb-4">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#FF6F61]/10 flex items-center justify-center shrink-0">
                      <Smartphone size={10} className="text-[#FF6F61]" />
                    </div>
                    <p className="bg-[#F9F5E7] p-2 rounded-xl rounded-tl-none text-[10px] text-[#004D40] leading-snug">
                      Can we see the house on Pine tomorrow?
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
    </div>
  );
}
