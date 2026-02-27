"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  Scale,
  Send,
  Smartphone,
  Star,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function LegalPage() {
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
        {/* Background Image with Professional Tropical Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=2000"
            alt="Lawyer sitting at a clean wooden desk reviewing documents"
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
            <Scale size={18} className="text-[#004D40]" />
            <span className="tracking-wide uppercase text-[#004D40]">
              Solutions for Legal
            </span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-7xl lg:text-8xl font-bold text-[#004D40] leading-[1.1] mb-8 tracking-tight">
            Win more clients by being the firm that{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              actually
            </span>{" "}
            follows up.
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/80 leading-relaxed max-w-3xl mx-auto font-medium">
            Most leads call three firms and hire the one that responds first.
            SurfBloom automates your intake follow-ups, review requests, and
            client communication so you're never the firm that called back too
            late.
          </p>
        </div>
      </section>

      {/* SECTION 1: AI Chatbot */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.pexels.com/photos/2893685/pexels-photo-2893685.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Empty law office at night with desk lamp on"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-[0.7]"
            />
            {/* Glowing AI Chat UI overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white/95 backdrop-blur-md rounded-[2rem] border border-[#00A5D4]/30 shadow-2xl overflow-hidden pb-2">
              <div className="bg-[#004D40] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative">
                  <MessageSquare className="text-white" size={20} />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#004D40]"></div>
                </div>
                <div>
                  <p className="font-bold text-white">Intake Assistant</p>
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <Clock size={10} /> 11:42 PM (After Hours)
                  </p>
                </div>
              </div>
              <div className="p-5 space-y-4 bg-[#F9F5E7]">
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  Hi, I was rear-ended on my way home from work today and I
                  don't know what to do next. Do you handle car accidents?
                </div>
                <div className="bg-[#00A5D4]/10 p-3 rounded-xl rounded-tr-none border border-[#00A5D4]/10 text-[#004D40] text-sm max-w-[85%] ml-auto shadow-sm">
                  I'm so sorry to hear that, but you're in the right place. We
                  handle personal injury claims. Are you currently safe and
                  receiving medical attention?
                </div>
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  Yes, I'm home now but my neck hurts.
                </div>
                <div className="bg-[#00A5D4]/10 p-3 rounded-xl rounded-tr-none border border-[#00A5D4]/10 text-[#004D40] text-sm max-w-[85%] ml-auto shadow-sm">
                  Understood. Let's get you on the phone with one of our
                  attorneys first thing in the morning. Does 9:00 AM work for a
                  free consultation?
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
              questions, captures lead information, and books consultations —
              all using your firm's name, tone, and practice areas.
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
      </section>

      {/* IMMERSIVE BREAK SECTION: The Power of First */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#004D40] to-[#00332A] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(0,77,64,0.4)]">
        {/* Calm Dawn Water Background */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?auto=compress&cs=tinysrgb&w=2000"
            alt="Calm morning ocean reflecting dawn light"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#00A5D4]/20 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#F9F5E7] font-bold flex flex-col md:flex-row items-center justify-center">
            The power of
            <span className="sb-font-great-vibes italic text-[#00A5D4] font-normal text-6xl md:text-9xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-sm">
              being first.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7]/80 font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            When someone needs a lawyer, they don't leave voicemails. They call
            down the list until someone answers. Be the firm that never misses a
            lead.
          </p>
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
              all your client conversations into a single inbox — SMS, webchat,
              and more in one thread per contact.
            </p>
            <p>
              Your whole team can see the history, pick up where someone left
              off, and respond without asking "did anyone already call them
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
              src="https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Paralegal at a desk with dual monitors mid-conversation"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Unified Inbox Overlay */}
            <div className="absolute bottom-[10%] right-[5%] w-[90%] md:w-[85%] bg-white/95 backdrop-blur-md rounded-[2rem] border border-[#00A5D4]/10 shadow-2xl overflow-hidden flex">
              {/* Left Sidebar (Contacts) */}
              <div className="w-1/3 border-r border-[#00A5D4]/10 bg-[#F9F5E7]/50 flex flex-col">
                <div className="p-3 border-b border-[#00A5D4]/10">
                  <p className="text-[10px] font-bold text-[#004D40] uppercase tracking-wider flex items-center gap-1">
                    <Smartphone size={12} /> Inbox
                  </p>
                </div>
                <div className="p-3 bg-white border-l-2 border-[#00A5D4]">
                  <p className="text-xs font-bold text-[#004D40] truncate">
                    Robert Mitchell
                  </p>
                  <p className="text-[10px] text-[#004D40]/60 truncate">
                    Did you receive the forms?
                  </p>
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-[#004D40] truncate">
                    Elena V.
                  </p>
                  <p className="text-[10px] text-[#004D40]/60 truncate">
                    Thank you so much!
                  </p>
                </div>
              </div>
              {/* Right Side (Chat) */}
              <div className="w-2/3 p-4 flex flex-col justify-between bg-white">
                <div className="space-y-3 mb-4">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#004D40]/10 flex items-center justify-center shrink-0">
                      <User size={10} className="text-[#004D40]" />
                    </div>
                    <p className="bg-[#F9F5E7] p-2 rounded-xl rounded-tl-none text-[10px] text-[#004D40] leading-snug">
                      Did you receive the intake forms I emailed over?
                    </p>
                  </div>
                  <div className="flex gap-2 flex-row-reverse">
                    <p className="bg-[#00A5D4] p-2 rounded-xl rounded-tr-none text-[10px] text-white leading-snug">
                      Yes Robert, we have them! Our paralegal is reviewing them
                      now and we will follow up this afternoon.
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

      {/* SECTION 3: Review Collection */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Lawyer and client shaking hands in a conference room doorway"
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
                    Harrison Legal Group
                  </p>
                  <p className="text-[#004D40]/70 text-xs leading-relaxed mt-1">
                    Hi Michael! We are so glad we could get your case resolved
                    favorably. If you have a minute, we'd appreciate a Google
                    review!
                  </p>
                  <p className="text-[#00A5D4] text-xs font-semibold mt-2">
                    review.link/harrison-law
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
              The firms with the most reviews win local search. When a client
              opts into your messaging, a workflow handles the rest — a
              personalized text goes out after a case wraps with a direct link
              to your Google review page.
            </p>
            <p>
              AI writes the message using the client's name and matter context
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

      {/* SECTION 4: Tasks */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Your team's entire to-do list in{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              one board
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Every follow-up, callback, and handoff becomes a task your team
              can see on a shared board. Table, Kanban, or Calendar — pick the
              view that works.
            </p>
            <p>
              Each task links to the client, review, or conversation that
              created it so nobody asks "which case was this for?" Built-in
              messaging lets your team discuss tasks without switching apps.
            </p>
            <Link
              href="/product/tasks"
              className="inline-flex items-center gap-2 font-bold text-[#00A5D4] hover:text-[#FF6F61] transition-colors mt-4 group"
            >
              Learn more about Tasks{" "}
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
              src="https://images.pexels.com/photos/8111863/pexels-photo-8111863.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Small legal team standing around a conference table discussing cases"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Kanban Task Overlay */}
            <div className="absolute bottom-[10%] right-[10%] w-[60%] bg-[#F9F5E7]/95 backdrop-blur-md rounded-[2rem] border border-[#004D40]/10 shadow-2xl overflow-hidden p-4 transform rotate-[-2deg]">
              <div className="flex items-center justify-between mb-3 border-b border-[#004D40]/10 pb-2">
                <p className="text-[10px] font-bold text-[#004D40] uppercase">
                  Urgent Follow-ups
                </p>
                <span className="bg-[#FF6F61] text-white text-[8px] px-2 py-0.5 rounded-full font-bold">
                  2 Tasks
                </span>
              </div>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-[#FF6F61]">
                  <p className="text-xs font-bold text-[#004D40] mb-1">
                    Call back new lead: Sarah M.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[#004D40]/60">
                    <AlertCircle size={10} className="text-[#FF6F61]" /> Overdue
                    by 1hr
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-[#00A5D4]">
                  <p className="text-xs font-bold text-[#004D40] mb-1">
                    Send engagement letter to Tom
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[#004D40]/60">
                    <CheckCircle2 size={10} className="text-[#10B981]" />{" "}
                    Assigned to Paralegal
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
