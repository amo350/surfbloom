"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  PieChart,
  ShieldCheck,
  Smartphone,
  Star,
  TrendingUp,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function FinancialServicesPage() {
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
        {/* Background Image with Trustworthy Professional Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=2000"
            alt="Financial advisor sitting across a desk from a couple"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#F9F5E7]/85 mix-blend-soft-light"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F5E7] via-[#F9F5E7]/70 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto pt-32">
          <div className="hero-elem inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-[#00A5D4]/20 text-[#00A5D4] font-bold text-sm mb-8 shadow-sm">
            <PieChart size={18} className="text-[#004D40]" />
            <span className="tracking-wide uppercase text-[#004D40]">
              Solutions for Financial Services
            </span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-7xl lg:text-8xl font-bold text-[#004D40] leading-[1.1] mb-8 tracking-tight">
            Your clients trust you with their money. Make them trust you with
            their{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              time.
            </span>
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/80 leading-relaxed max-w-3xl mx-auto font-medium">
            Financial advisors, insurance agents, and accountants live on
            referrals and reputation. SurfBloom automates your client
            follow-ups, review collection, and outreach so relationships stay
            warm without another thing on your calendar.
          </p>
        </div>
      </section>

      {/* SECTION 1: Review Collection */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.pexels.com/photos/5816297/pexels-photo-5816297.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Client shaking hands with their financial advisor in an office doorway"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Floating Notification UI overlay */}
            <div className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-[#00A5D4]/20 shadow-lg max-w-sm animate-pulse-slow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FF6F61]/10 rounded-full flex items-center justify-center shrink-0">
                  <Star className="text-[#FF6F61] fill-[#FF6F61]" size={24} />
                </div>
                <div>
                  <p className="font-bold text-[#004D40] text-lg">
                    Crest Wealth Management
                  </p>
                  <p className="text-[#004D40]/70 text-sm leading-snug mt-1">
                    Hey Sarah! It was great reviewing your portfolio today. If
                    you value our partnership, we'd appreciate a quick Google
                    review!
                  </p>
                  <p className="text-[#00A5D4] text-sm font-semibold mt-2">
                    review.link/crest-wealth
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
              The advisors and agents with the most reviews win local search.
              When a client opts into your messaging, a workflow handles the
              rest — a personalized text goes out after a meeting, filing, or
              policy renewal with a direct link to your Google review page.
            </p>
            <p>
              AI writes the message using the client's name and interaction
              context so it reads like a personal follow-up, not a mass blast.
              Didn't leave a review after five days? A gentle nudge goes out
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
              questions, captures lead information, and books consultations —
              all using your firm's name, tone, and services.
            </p>
            <p>
              Your prospects think they're talking to your office. You see the
              full conversation waiting for you in the morning.
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
              src="https://images.pexels.com/photos/8112113/pexels-photo-8112113.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Small financial office at night with desk lamp glowing"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-[0.7] contrast-125"
            />
            {/* Glowing AI Chat UI overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white/95 backdrop-blur-md rounded-3xl border border-[#00A5D4]/30 shadow-2xl overflow-hidden pb-2">
              <div className="bg-[#004D40] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative">
                  <ShieldCheck className="text-white" size={20} />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#004D40]"></div>
                </div>
                <div>
                  <p className="font-bold text-white">Firm Assistant</p>
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <Clock size={10} /> 8:15 PM (After Hours)
                  </p>
                </div>
              </div>
              <div className="p-5 space-y-4 bg-[#F9F5E7]">
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  Hi, I recently changed jobs and need help rolling over my
                  401k. Do you handle that?
                </div>
                <div className="bg-[#00A5D4]/10 p-3 rounded-xl rounded-tr-none border border-[#00A5D4]/10 text-[#004D40] text-sm max-w-[85%] ml-auto shadow-sm">
                  Yes, we specialize in 401k rollovers and retirement planning!
                  Would you like me to schedule a complimentary 15-minute
                  introductory call with one of our advisors tomorrow? 📊
                </div>
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  That sounds great. I'm free after 2 PM.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMMERSIVE BREAK SECTION: Compounding Trust */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#004D40] to-[#002B24] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(0,77,64,0.4)]">
        {/* Calm Sunrise / Steady Architecture Background */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.pexels.com/photos/1420440/pexels-photo-1420440.jpeg?auto=compress&cs=tinysrgb&w=2000"
            alt="Calm sunrise over a stable landscape"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#00A5D4]/20 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#F9F5E7] font-bold flex flex-col md:flex-row items-center justify-center">
            Compounding
            <span className="sb-font-great-vibes italic text-[#00A5D4] font-normal text-6xl md:text-9xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-sm">
              Trust.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7]/80 font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            Wealth management is built on relationships. Consistent,
            professional communication ensures your clients never feel like just
            another account number.
          </p>
        </div>
      </section>

      {/* SECTION 3: Campaigns */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.pexels.com/photos/1308550/pexels-photo-1308550.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Professional reading a text on their phone while walking downtown"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Campaign Sequence Overlay */}
            <div className="absolute bottom-[10%] left-[5%] w-[90%] md:w-[80%] bg-white/95 backdrop-blur-md rounded-2xl border border-[#00A5D4]/20 shadow-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-3 bg-[#F9F5E7] p-3 rounded-xl border border-[#00A5D4]/10">
                <Briefcase className="text-[#00A5D4]" size={16} />
                <div className="flex-grow">
                  <p className="text-xs font-bold text-[#004D40]">
                    Audience: All Active Clients
                  </p>
                  <p className="text-[10px] text-[#004D40]/60">
                    Tag matches "Tax Prep"
                  </p>
                </div>
              </div>
              <div className="flex justify-center -my-1 z-10">
                <div className="bg-[#FF6F61] text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={8} /> February 1st
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border-2 border-[#00A5D4]/30 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00A5D4]"></div>
                <Smartphone className="text-[#00A5D4]" size={16} />
                <div className="flex-grow pl-1">
                  <p className="text-xs font-bold text-[#004D40]">
                    Tax Document Reminder
                  </p>
                  <p className="text-[10px] text-[#004D40]/70 italic mt-0.5">
                    "Tax season is here! Please remember to upload your W-2s and
                    1099s to the secure client portal..."
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#00A5D4] bg-[#00A5D4]/10 px-2 py-1 rounded-full whitespace-nowrap">
                  Sent
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Send the right message at the right{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
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
              Send a tax season reminder to your full client list, automate a
              check-in after every annual review, or re-engage prospects who
              requested a quote but never followed through. Every send is
              tracked so you know what landed and what didn't.
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
      </section>

      {/* SECTION 4: CRM */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Every client. Every interaction.{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
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
              Import your existing client list, capture new leads from web forms
              and QR codes, and tag contacts however makes sense for your
              business. When you open a client's record, you see their entire
              history — every conversation, every touchpoint — not just a name
              and account number.
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
        <div className="relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.pexels.com/photos/8112128/pexels-photo-8112128.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Wall in a financial office with framed credentials and client thank-you cards"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Contact Record Overlay */}
            <div className="absolute top-[15%] right-[10%] w-[65%] max-w-xs bg-white/95 backdrop-blur-sm rounded-3xl border border-[#004D40]/10 shadow-2xl p-5">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#00A5D4]/10">
                <div className="w-12 h-12 bg-[#00A5D4]/10 rounded-full flex items-center justify-center text-[#00A5D4] font-bold text-lg">
                  DB
                </div>
                <div>
                  <p className="font-bold text-[#004D40]">David Brooks</p>
                  <p className="text-xs text-[#004D40]/60 flex items-center gap-1">
                    Client since 2018
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] font-bold bg-[#F9F5E7] text-[#004D40]/70 border border-[#004D40]/10 px-2 py-1 rounded-md">
                  High Net Worth
                </span>
                <span className="text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-2 py-1 rounded-md">
                  Retirement Planning
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#004D40]/70">
                  <div className="w-2 h-2 rounded-full bg-[#00A5D4]"></div>{" "}
                  Attended Q3 Annual Review
                </div>
                <div className="flex items-center gap-2 text-xs text-[#004D40]/70">
                  <div className="w-2 h-2 rounded-full bg-[#FF6F61]"></div> Left
                  5-Star Review
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
