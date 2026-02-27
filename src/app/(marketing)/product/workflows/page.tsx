"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Workflow,
  BrainCircuit,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Clock,
  UserPlus,
  Zap,
  PlayCircle,
  GitBranch,
  Activity,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const TEMPLATES = [
  {
    title: "The Review Machine",
    desc: "Automated lifecycle: ask, follow-up, and thank you.",
    icon: <Sparkles className="text-[#FF6F61]" />,
  },
  {
    title: "Damage Control",
    desc: "Catch negative feedback before it goes public.",
    icon: <ShieldAlert className="text-[#00A5D4]" />,
  },
  {
    title: "Appointment Reminder",
    desc: "Reduce no-shows with smart AI confirmations.",
    icon: <Clock className="text-[#004D40]" />,
  },
  {
    title: "No-Show Recovery",
    desc: "Automatically re-engage missed appointments.",
    icon: <Workflow className="text-[#FF6F61]" />,
  },
  {
    title: "Welcome Sequence",
    desc: "Onboard new clients with your brand's voice.",
    icon: <CheckCircle2 className="text-[#00A5D4]" />,
  },
  {
    title: "Referral Request",
    desc: "Turn happy clients into your best marketers.",
    icon: <UserPlus className="text-[#FF6F61]" />,
  },
];

export default function WorkflowsPage() {
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

      // Deep immersive transition text reveal
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
      className="min-h-screen bg-[#F9F5E7] selection:bg-[#FF6F61] selection:text-white pb-12 font-montserrat"
    >
      {/* REWORKED HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 md:px-12 overflow-hidden bg-[#F9F5E7]">
        {/* Layer 1: Tropical Palm Shadows (Updated with reliable URL) */}
        <div
          className="absolute inset-0 z-0 opacity-[0.05] mix-blend-multiply pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1615800098779-1be32e71225c?auto=format&fit=crop&w=2000&q=80')",
          }}
        />

        {/* Layer 2: Modern Workflow Grid */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#004D401A_1px,transparent_1px),linear-gradient(to_bottom,#004D401A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto pt-40 md:pt-56 pb-20">
          <h1 className="hero-elem sb-font-playfair text-6xl md:text-8xl lg:text-[6rem] font-bold text-[#004D40] leading-[1.05] mb-10 tracking-tight drop-shadow-sm">
            Visual workflows that run your marketing for{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              you
            </span>
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/75 leading-relaxed max-w-3xl mx-auto font-medium">
            Drag nodes onto a canvas, connect them, and watch your automations
            come alive. Every review request, follow-up text, and task
            assignment flows through a tree your whole team can see and
            understand.
          </p>
        </div>
      </section>

      {/* SECTION 1: Build */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          <div className="reveal-item float-ui relative rounded-[3rem] bg-white border border-[#00A5D4]/20 shadow-[0_20px_50px_rgba(0,77,64,0.08)] p-3 overflow-hidden group">
            <div className="absolute inset-0 bg-[#00A5D4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none rounded-[3rem]"></div>
            <Image
              src="/logos/node-workflows2.png"
              alt="SurfBloom Visual Workflow Canvas"
              width={800}
              height={600}
              className="w-full h-auto rounded-[2.5rem] object-cover border border-[#00A5D4]/10 shadow-sm"
              priority
              sizes="(max-width: 1024px) 100vw, 800px"
            />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Build automations you can actually{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              see
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/70 text-lg">
            <p>
              Most automation tools hide your logic behind menus and dropdowns.
              You set something up, forget how it works, and pray it's still
              running three months later.
            </p>
            <p>
              SurfBloom workflows are visual trees. You drag a trigger onto a
              canvas — a new contact, an incoming review, a missed call. Then
              you connect it to what should happen next: send a text, generate a
              message with AI, create a task, wait three days, check if they
              responded. Every step is a node. Every connection is a line you
              can follow with your eyes.
            </p>
            <p className="font-semibold text-[#004D40]">
              Your front desk manager can look at a workflow tree and understand
              exactly what happens when a new client walks in. That's the point.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: Infinite combinations */}
      <section className="scroll-section relative py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#00A5D4]/20 mt-12">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-6xl font-bold text-[#004D40] mb-6">
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2 text-5xl md:text-7xl">
              Infinite
            </span>{" "}
            combinations.
          </h2>
          <p className="reveal-item text-[#004D40]/70 text-lg md:text-xl">
            Every workflow is assembled from the same building blocks — a
            library of nodes across four categories that snap together however
            your business needs them to.
          </p>
        </div>

        {/* 2x2 Grid for the Building Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Triggers */}
          <div className="reveal-item bg-white p-10 rounded-[3rem] border border-[#00A5D4]/10 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#FF6F61]/10 rounded-2xl flex items-center justify-center">
                <Zap className="text-[#FF6F61]" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-[#004D40]">Triggers</h3>
                {/* <span className="text-sm font-mono text-[#FF6F61] bg-[#FF6F61]/10 px-2 py-0.5 rounded-full">
                  12 TYPES
                </span> */}
              </div>
            </div>
            <p className="text-[#004D40]/70 leading-relaxed">
              Triggers listen for the moments that matter. A contact is created,
              a review comes in, an SMS lands, a survey gets completed, a call
              is missed after hours. Your workflows fire exactly when they
              should — not on a schedule, but the instant something happens.
            </p>
          </div>

          {/* Actions */}
          <div className="reveal-item bg-white p-10 rounded-[3rem] border border-[#00A5D4]/10 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#00A5D4]/10 rounded-2xl flex items-center justify-center">
                <PlayCircle className="text-[#00A5D4]" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-[#004D40]">Actions</h3>
                {/* <span className="text-sm font-mono text-[#00A5D4] bg-[#00A5D4]/10 px-2 py-0.5 rounded-full">
                  15 TYPES
                </span> */}
              </div>
            </div>
            <p className="text-[#004D40]/70 leading-relaxed">
              Actions are what happens next. Send a text. Fire off an email.
              Create a task on your kanban board. Respond to a review. Post to
              Slack. Push a notification to social media. Log a note on the
              contact. Cover every channel your business touches.
            </p>
          </div>

          {/* Logic */}
          <div className="reveal-item bg-white p-10 rounded-[3rem] border border-[#00A5D4]/10 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#004D40]/10 rounded-2xl flex items-center justify-center">
                <GitBranch className="text-[#004D40]" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-[#004D40]">Logic</h3>
                {/* <span className="text-sm font-mono text-[#004D40] bg-[#004D40]/10 px-2 py-0.5 rounded-full">
                  6 NODES
                </span> */}
              </div>
            </div>
            <p className="text-[#004D40]/70 leading-relaxed">
              Logic controls the flow. If a customer left a 5-star review, go
              left — thank them. If they left a 2-star, go right — trigger
              damage control. Wait three days. Loop through contacts.
              Decision-making power that used to require a developer.
            </p>
          </div>

          {/* AI */}
          <div className="reveal-item bg-[#004D40] text-[#F9F5E7] p-10 rounded-[3rem] border border-[#004D40] shadow-[0_20px_40px_rgba(0,77,64,0.15)] hover:-translate-y-2 transition-transform">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#F9F5E7]/10 rounded-2xl flex items-center justify-center">
                <BrainCircuit className="text-[#FF6F61]" />
              </div>
              <div>
                <h3 className="font-bold text-2xl">Artificial Intelligence</h3>
                {/* <span className="text-sm font-mono text-[#00A5D4] bg-[#00A5D4]/20 px-2 py-0.5 rounded-full">
                  4 PROVIDERS
                </span> */}
              </div>
            </div>
            <p className="text-[#F9F5E7]/80 leading-relaxed">
              AI ties it all together. One node, four providers, three modes.
              Generate content, analyze incoming data, or summarize long text —
              all inside the same workflow, all using your brand voice, all
              running without you lifting a finger.
            </p>
          </div>
        </div>

        {/* Real-time Execution Banner */}
        <div className="reveal-item bg-gradient-to-r from-[#00A5D4]/10 to-transparent border border-[#00A5D4]/20 rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-1/2 -left-10 w-32 h-32 bg-[#FF6F61]/20 rounded-full blur-[40px] -translate-y-1/2 pointer-events-none"></div>
          <div className="w-16 h-16 shrink-0 rounded-full bg-white border border-[#00A5D4]/30 flex items-center justify-center shadow-md relative">
            <Activity className="text-[#00A5D4]" size={32} />
            <div className="absolute top-0 right-0 w-4 h-4 bg-[#FF6F61] rounded-full animate-ping"></div>
            <div className="absolute top-0 right-0 w-4 h-4 bg-[#FF6F61] rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h4 className="font-bold text-2xl text-[#004D40] mb-2">
              Watch it run in real time.
            </h4>
            <p className="text-[#004D40]/70">
              When a workflow fires, every node executes in sequence. Each node
              lights up as it runs on the canvas, and the full execution history
              is logged so you can trace exactly what happened to every contact,
              every time.
            </p>
          </div>
        </div>
      </section>

      {/* IMMERSIVE BREAK SECTION: No-Show Recovery */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-[#004D40] px-12 py-40 my-24 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(0,77,64,0.2)]">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1505144808419-1957a94ca61e"
            alt="Deep tropical forest"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#00A5D4] font-bold flex flex-row flex-wrap items-baseline justify-center gap-x-3 md:gap-x-4">
            Automate
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal text-6xl md:text-8xl tracking-wide">
              No-Show Recovery
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7]/90 font-medium max-w-3xl leading-relaxed">
            Turn missed appointments into re-booked revenue before you even
            realize they didn't walk through the door.
          </p>
        </div>
      </section>

      {/* SECTION 2: AI Brain */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            AI built into every workflow — your choice of{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              provider
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/70 text-lg">
            <p>
              The AI node is the most powerful piece on the canvas. Drop it into
              any workflow and tell it what to do: write a personalized review
              request, analyze a call transcript, summarize feedback from a
              survey, or draft a follow-up message in your brand's voice.
            </p>
            <p>
              Then pick which AI runs it. Claude, GPT, Gemini, or Grok — each
              available from a single dropdown. Different providers are better
              at different things. Switch between them anytime without
              rebuilding your workflow. The node even shows the provider's icon
              on the canvas so you always know what's powering each step.
            </p>
            <p className="font-semibold text-[#004D40]">
              Every message the AI writes uses your business name, your tone,
              your services, and your unique selling points. It doesn't sound
              like a robot. It sounds like you on your best day.
            </p>
          </div>
        </div>

        {/* Sleek CSS Mockup of AI Node */}
        <div className="reveal-item float-ui relative rounded-[3rem] bg-white border border-[#00A5D4]/20 shadow-[0_20px_50px_rgba(0,77,64,0.08)] p-8">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#00A5D4]/10">
            <div className="w-10 h-10 rounded-xl bg-[#FF6F61]/10 flex items-center justify-center">
              <BrainCircuit className="text-[#FF6F61]" />
            </div>
            <div>
              <h3 className="font-bold text-[#004D40]">AI Processing Node</h3>
              <p className="text-xs font-mono text-[#004D40]/50">
                ID: nd_8x92mA
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-[#004D40]/70 uppercase tracking-wider mb-2 block">
                AI Provider
              </label>
              <div className="w-full rounded-xl border border-[#00A5D4]/20 bg-[#F9F5E7]/50 p-3 flex justify-between items-center cursor-pointer hover:border-[#00A5D4] transition-colors">
                <span className="font-semibold text-[#004D40] flex items-center gap-2">
                  <Sparkles size={16} className="text-[#00A5D4]" /> Claude 3.5
                  Sonnet
                </span>
                <span className="text-[#004D40]/40">▼</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="text-center py-2 rounded-lg bg-[#FF6F61] text-white text-sm font-semibold cursor-pointer">
                Generate
              </div>
              <div className="text-center py-2 rounded-lg bg-[#F9F5E7] text-[#004D40]/60 text-sm font-semibold cursor-pointer hover:bg-[#F9F5E7]/80">
                Analyze
              </div>
              <div className="text-center py-2 rounded-lg bg-[#F9F5E7] text-[#004D40]/60 text-sm font-semibold cursor-pointer hover:bg-[#F9F5E7]/80">
                Summarize
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#004D40]/70 uppercase tracking-wider mb-2 block">
                System Prompt
              </label>
              <div className="w-full rounded-xl border border-[#00A5D4]/20 bg-[#F9F5E7]/50 p-3 text-sm text-[#004D40]/80 font-mono h-24 overflow-hidden relative">
                You are the front desk manager for {"{{business.name}}"}. Draft
                a friendly SMS to {"{{contact.first_name}}"} thanking them for
                their visit today and gently asking for a review. Keep it under
                160 chars...
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F9F5E7] to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Templates */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-8">
            Start in minutes, not{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              weeks
            </span>
          </h2>
          <div className="reveal-item text-[#004D40]/80 text-lg space-y-6 leading-relaxed">
            <p>
              You don't have to start from a blank canvas. SurfBloom ships with
              ten templates built for the exact automations local businesses
              need. Pick a template, customize the messages, activate it, and
              it's live.
            </p>
            <div className="p-6 rounded-3xl bg-white border border-[#00A5D4]/15 shadow-sm text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF6F61]"></div>
              <p className="font-semibold text-[#004D40]">
                The Review Machine alone handles the entire lifecycle: new
                contact comes in, AI writes a personalized review request, sends
                it via SMS, waits five days, checks if they left a review,
                thanks them if they did, nudges them if they didn't.{" "}
                <span className="text-[#FF6F61]">
                  That workflow replaces what used to take your team thirty
                  minutes per patient.
                </span>
              </p>
            </div>
            <p>
              Every template is fully editable. Add nodes, remove steps, change
              the timing, swap the AI provider. They're starting points, not
              limitations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((tpl, i) => (
            <div
              key={tpl.title}
              className="group bg-white p-8 rounded-[2.5rem] border border-[#00A5D4]/10 shadow-sm hover:shadow-[0_20px_40px_rgba(0,165,212,0.08)] hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F9F5E7] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {tpl.icon}
              </div>
              <h3 className="font-bold text-xl text-[#004D40] mb-3">
                {tpl.title}
              </h3>
              <p className="text-[#004D40]/60 text-sm flex-grow">
                {tpl.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
