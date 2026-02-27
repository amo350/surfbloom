"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Star,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function DentalPage() {
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
        {/* Background Image with Tropical Warmth Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=2000&q=80"
            alt="Warm modern dental office reception"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#F9F5E7]/80 mix-blend-soft-light"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F5E7] via-[#F9F5E7]/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto pt-32">
          <div className="hero-elem inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-[#00A5D4]/20 text-[#00A5D4] font-bold text-sm mb-8 shadow-sm">
            <Sparkles size={18} className="text-[#FF6F61]" />
            <span className="tracking-wide uppercase text-[#004D40]">
              Solutions for Dental
            </span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-7xl lg:text-8xl font-bold text-[#004D40] leading-[1.1] mb-8 tracking-tight">
            Your front desk is busy. <br />
            Let SurfBloom handle the{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              rest.
            </span>
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/80 leading-relaxed max-w-3xl mx-auto font-medium">
            Automate review requests, follow-ups, and patient communication so
            your team can focus on the people in the chair — not the ones who
            left without rebooking.
          </p>
        </div>
      </section>

      {/* SECTION 1: Review Collection */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80"
              alt="Smiling patient leaving dental office"
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
                    SurfBloom Dental
                  </p>
                  <p className="text-[#004D40]/70 text-sm leading-snug mt-1">
                    Hi Sarah! Thanks for visiting today. Would you mind taking
                    30 seconds to share your experience?
                  </p>
                  <p className="text-[#00A5D4] text-sm font-semibold mt-2">
                    review.link/sarah-j
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

      {/* IMMERSIVE BREAK SECTION: Warm Sunset Theme */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#FF6F61] to-[#FF8A7A] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(255,111,97,0.3)]">
        {/* Warm Tropical Sunset Background */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1616036740257-9448561d3746?auto=format&fit=crop&w=2000&q=80"
            alt="Warm golden hour tropical light"
            fill
            className="object-cover"
          />
        </div>
        {/* Warm Glare Effect representing comfort */}
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-[#F9F5E7]/30 rounded-full blur-[120px] -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#004D40] font-bold flex flex-col md:flex-row items-center justify-center">
            Warmth in every
            <span className="sb-font-great-vibes italic text-[#F9F5E7] font-normal text-6xl md:text-8xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-sm">
              interaction.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7] font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            Patients feel the difference when your practice runs calmly,
            efficiently, and attentively—even when you're closed.
          </p>
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
              questions, captures lead information, and books appointments — all
              using your practice name, tone, and services.
            </p>
            <p>
              Your patients think they're talking to your team. You see the full
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
        <div className="relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80"
              alt="Empty dental office front desk at night"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-[0.8]"
            />
            {/* Glowing AI Chat UI overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white/95 backdrop-blur-md rounded-3xl border border-[#00A5D4]/30 shadow-2xl overflow-hidden">
              <div className="bg-[#00A5D4] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
                  <MessageSquare className="text-white" size={20} />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#FF6F61] rounded-full border-2 border-[#00A5D4]"></div>
                </div>
                <div>
                  <p className="font-bold text-white">After-Hours Assistant</p>
                  <p className="text-white/70 text-xs">Replies instantly</p>
                </div>
              </div>
              <div className="p-5 space-y-4 bg-[#F9F5E7]">
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  Do you accept Delta Dental insurance?
                </div>
                <div className="bg-[#00A5D4]/10 p-3 rounded-xl rounded-tr-none border border-[#00A5D4]/10 text-[#004D40] text-sm max-w-[85%] ml-auto shadow-sm">
                  Yes, we are in-network with Delta Dental! Would you like to
                  see our earliest opening for a cleaning tomorrow?
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-[#00A5D4]/40 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#00A5D4]/40 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-[#00A5D4]/40 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Workflows */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80"
              alt="Dental office manager relaxing at desk"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Workflow Overlay on Monitor */}
            <div className="absolute top-[25%] right-[15%] w-[45%] h-[40%] bg-white/90 backdrop-blur-sm rounded-xl border border-[#00A5D4]/20 shadow-inner overflow-hidden p-4 transform rotate-[-2deg]">
              <div className="flex items-center gap-2 mb-4 opacity-50">
                <Workflow size={14} className="text-[#00A5D4]" />
                <span className="text-xs font-bold text-[#004D40]">
                  New Patient Flow
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-8 bg-[#FF6F61]/10 border border-[#FF6F61] rounded-lg flex items-center justify-center text-[8px] font-bold text-[#004D40]">
                  New Patient Added
                </div>
                <div className="w-0.5 h-4 bg-[#00A5D4]/30"></div>
                <div className="w-24 h-8 bg-[#00A5D4]/10 border border-[#00A5D4] rounded-lg flex items-center justify-center text-[8px] font-bold text-[#004D40]">
                  Send Welcome SMS
                </div>
                <div className="w-0.5 h-4 bg-[#00A5D4]/30"></div>
                <div className="w-24 h-8 bg-[#004D40]/10 border border-[#004D40] rounded-lg flex items-center justify-center text-[8px] font-bold text-[#004D40]">
                  Wait 3 Days
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
              Build visual workflows that handle your repetitive marketing
              automatically. Drag triggers and actions onto a canvas, connect
              them, and let them run.
            </p>
            <p>
              New patient signs up — welcome text goes out, review request
              follows three days later, task gets created if they don't respond.
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
              Each task links to the patient, review, or conversation that
              created it so nobody asks "who was this for?" Built-in messaging
              lets your team discuss tasks without switching apps.
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
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80"
              alt="Dental team collaborating around a tablet"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Kanban Overlay on Tablet */}
            <div className="absolute bottom-[10%] left-[20%] w-[60%] h-[50%] bg-[#F9F5E7]/95 backdrop-blur-md rounded-xl border border-[#004D40]/10 shadow-2xl overflow-hidden p-4 transform rotate-[3deg]">
              <div className="flex gap-3 h-full">
                {/* Column 1 */}
                <div className="flex-1 bg-white/50 rounded-lg p-2">
                  <p className="text-[10px] font-bold text-[#004D40]/60 mb-2 uppercase">
                    To Do
                  </p>
                  <div className="bg-white p-2 rounded-lg shadow-sm border-l-2 border-[#FF6F61] mb-2">
                    <p className="text-[10px] font-bold text-[#004D40] truncate">
                      Call back Mark S.
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-sm border-l-2 border-[#00A5D4]">
                    <p className="text-[10px] font-bold text-[#004D40] truncate">
                      Insurance verification
                    </p>
                  </div>
                </div>
                {/* Column 2 */}
                <div className="flex-1 bg-white/50 rounded-lg p-2">
                  <p className="text-[10px] font-bold text-[#004D40]/60 mb-2 uppercase">
                    In Progress
                  </p>
                  <div className="bg-white p-2 rounded-lg shadow-sm border-l-2 border-[#004D40]">
                    <div className="flex items-center gap-1 mb-1">
                      <CheckCircle2 size={8} className="text-[#004D40]" />{" "}
                      <p className="text-[10px] font-bold text-[#004D40] truncate">
                        Post-op follow up
                      </p>
                    </div>
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
