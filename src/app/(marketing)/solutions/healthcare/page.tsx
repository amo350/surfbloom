"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  HeartPulse,
  MessageSquare,
  Star,
  ThumbsUp,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function HealthcarePage() {
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
        {/* Background Image with Calming Clinical Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="https://images.pexels.com/photos/4483327/pexels-photo-4483327.jpeg?auto=compress&cs=tinysrgb&w=2000"
            alt="Calm modern medical clinic waiting room"
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
            <HeartPulse size={18} className="text-[#FF6F61]" />
            <span className="tracking-wide uppercase text-[#004D40]">
              Solutions for Healthcare
            </span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-7xl lg:text-8xl font-bold text-[#004D40] leading-[1.1] mb-8 tracking-tight">
            Better patient communication without{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              more
            </span>{" "}
            admin work.
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/80 leading-relaxed max-w-3xl mx-auto font-medium">
            Your staff is stretched thin. SurfBloom automates appointment
            follow-ups, review collection, and patient outreach so your team
            spends less time on the phone and more time on care.
          </p>
        </div>
      </section>

      {/* SECTION 1: AI Chatbot */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80"
              alt="Empty medical clinic hallway at night"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-[0.7]"
            />
            {/* Glowing AI Chat UI overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white/95 backdrop-blur-md rounded-[2rem] border border-[#00A5D4]/30 shadow-2xl overflow-hidden pb-2">
              <div className="bg-[#00A5D4] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
                  <Activity className="text-white" size={20} />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#00A5D4]"></div>
                </div>
                <div>
                  <p className="font-bold text-white">Clinic Concierge</p>
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <Clock size={10} /> 9:15 PM (After Hours)
                  </p>
                </div>
              </div>
              <div className="p-5 space-y-4 bg-[#F9F5E7]">
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  Hi, I need to schedule a follow-up appointment with Dr. Evans
                  for my knee.
                </div>
                <div className="bg-[#00A5D4]/10 p-3 rounded-xl rounded-tr-none border border-[#00A5D4]/10 text-[#004D40] text-sm max-w-[85%] ml-auto shadow-sm">
                  I can help you with that! Dr. Evans has openings tomorrow at
                  10:00 AM or 2:30 PM. Do either of those work for you? 🩺
                </div>
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  10 AM is perfect.
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
              questions, captures lead information, and books appointments — all
              using your practice name, tone, and services.
            </p>
            <p>
              Your patients think they're talking to your front desk. You see
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
      </section>

      {/* SECTION 2: Surveys */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Know what your patients{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              actually
            </span>{" "}
            think
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Send short surveys after visits to catch problems before they
              become bad reviews. Responses flow straight into your CRM — tied
              to the patient, not floating in a spreadsheet.
            </p>
            <p>
              Low score? A workflow can automatically create a follow-up task
              for your team to reach out and make it right. Track satisfaction
              trends over time and spot issues before they cost you referrals.
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
        <div className="relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80"
              alt="Patient walking out of medical clinic looking at phone"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Survey UI Overlay */}
            <div className="absolute bottom-[10%] left-[-5%] w-[110%] md:w-[85%] md:left-[7.5%] bg-white/95 backdrop-blur-md rounded-2xl border border-[#00A5D4]/20 shadow-xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-[#00A5D4]">
                  <ClipboardList size={18} />
                  <span className="font-bold text-sm">Post-Visit Survey</span>
                </div>
                <span className="text-[10px] font-bold text-white bg-[#10B981] px-2 py-1 rounded-md shadow-sm">
                  SYNCED TO CRM
                </span>
              </div>
              <p className="text-[#004D40] font-semibold text-sm">
                How was your visit with Dr. Evans today?
              </p>
              <div className="flex justify-between items-center bg-[#F9F5E7] p-2 rounded-xl border border-[#00A5D4]/10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <div
                    key={num}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${num === 9 ? "bg-[#00A5D4] text-white shadow-md scale-110" : "bg-white text-[#004D40]/50 border border-gray-200"}`}
                  >
                    {num}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#004D40]/60 italic border-l-2 border-[#00A5D4]/30 pl-2">
                "Wait time was less than 5 minutes. The nurse was very gentle."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* IMMERSIVE BREAK SECTION: Unwavering Care */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#00A5D4] to-[#008080] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(0,165,212,0.2)]">
        {/* Serene Wellness/Nature Background */}
        <div className="absolute inset-0 opacity-25 mix-blend-color-burn pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=2000&q=80"
            alt="Serene tropical wellness nature"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-[#F9F5E7]/20 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#F9F5E7] font-bold flex flex-col md:flex-row items-center justify-center drop-shadow-sm">
            Unwavering
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal text-6xl md:text-9xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-md">
              Care.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7]/90 font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            Let the software handle the scheduling, the follow-ups, and the
            reviews so your team can focus entirely on the patient in the room.
          </p>
        </div>
      </section>

      {/* SECTION 3: Review Collection */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
              alt="Doctor and patient shaking hands in exam room"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-[1.05]"
            />
            {/* Floating Notification UI overlay */}
            <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-[#00A5D4]/20 shadow-lg max-w-xs animate-pulse-slow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FF6F61]/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Star className="text-[#FF6F61] fill-[#FF6F61]" size={20} />
                </div>
                <div>
                  <p className="font-bold text-[#004D40] text-[15px]">
                    Oak Wellness Clinic
                  </p>
                  <p className="text-[#004D40]/70 text-xs leading-relaxed mt-1">
                    Hi David! Thanks for visiting us today. If you had a great
                    experience with Dr. Smith, we'd love a quick Google review!
                  </p>
                  <p className="text-[#00A5D4] text-xs font-semibold mt-2">
                    review.link/oak-wellness
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
              The practices with the most reviews win local search. When a
              patient opts into your messaging, a workflow handles the rest — a
              personalized text goes out after every visit with a direct link to
              your Google review page.
            </p>
            <p>
              AI writes the message using the patient's name and service details
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
              Build visual workflows that handle your repetitive outreach
              automatically. Drag triggers and actions onto a canvas, connect
              them, and let them run.
            </p>
            <p>
              Patient completes a visit — thank-you text goes out, survey
              follows the next day, review request three days later, task gets
              created if they don't respond. You see every step on a visual
              tree, not buried in settings. No code, no guesswork.
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
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80"
              alt="Clinic office manager relaxed at desk"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Workflow Overlay */}
            <div className="absolute top-[20%] right-[10%] w-[50%] bg-white/95 backdrop-blur-sm rounded-xl border border-[#00A5D4]/20 shadow-2xl overflow-hidden p-4 transform rotate-[2deg]">
              <div className="flex items-center gap-2 mb-4">
                <Workflow size={14} className="text-[#00A5D4]" />
                <span className="text-xs font-bold text-[#004D40]">
                  Post-Visit Flow
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-full p-2 bg-[#FF6F61]/10 border border-[#FF6F61]/30 rounded-lg flex items-center gap-2 text-[10px] font-bold text-[#004D40]">
                  <CheckCircle2 size={12} className="text-[#FF6F61]" /> Visit
                  Completed
                </div>
                <div className="w-0.5 h-3 bg-[#00A5D4]/30"></div>
                <div className="w-full p-2 bg-[#00A5D4]/10 border border-[#00A5D4]/30 rounded-lg flex items-center gap-2 text-[10px] font-bold text-[#004D40]">
                  <MessageSquare size={12} className="text-[#00A5D4]" /> Send
                  Thank You + Survey
                </div>
                <div className="w-0.5 h-3 bg-[#00A5D4]/30"></div>
                <div className="w-full p-2 bg-[#004D40]/10 border border-[#004D40]/20 rounded-lg flex items-center gap-2 text-[10px] font-bold text-[#004D40]">
                  <ThumbsUp size={12} className="text-[#004D40]" /> Logic: If
                  Survey {">"} 8
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
