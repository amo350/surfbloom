"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MessageSquare,
  Smartphone,
  Globe,
  Bot,
  CheckCircle2,
  ArrowRight,
  Zap,
  User,
  Users,
  Clock,
  Send,
  Calendar,
  PhoneMissed,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ConversationsPage() {
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
      {/* TEXT-ONLY HERO SECTION */}
      <section className="relative min-h-[75vh] flex flex-col justify-center items-center text-center px-6 md:px-12 overflow-hidden bg-[#F9F5E7]">
        {/* Layer 1: Clean/Collaborative Overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.07] mix-blend-multiply pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=2000')",
          }}
        />

        {/* Layer 2: Modern Grid Fade */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#004D401A_1px,transparent_1px),linear-gradient(to_bottom,#004D401A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto pt-40 md:pt-48 pb-20">
          <div className="hero-elem inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-[#00A5D4]/20 text-[#00A5D4] font-bold text-sm mb-10 shadow-sm">
            <MessageSquare size={18} />
            <span className="tracking-wide uppercase">Unified Inbox</span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-8xl font-bold text-[#004D40] leading-[1.05] mb-8 tracking-tight drop-shadow-sm">
            One inbox. <br />
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              Every
            </span>{" "}
            conversation.
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/75 leading-relaxed max-w-4xl mx-auto font-medium">
            Stop checking three apps to see who messaged you. SurfBloom pulls
            every SMS, webchat, and chatbot conversation into a single inbox —
            threaded by contact, visible to your whole team.
          </p>
        </div>
      </section>

      {/* SECTION 1: Unified Threads */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative flex justify-center">
          {/* CSS Mockup: Multi-Channel Thread */}
          <div className="reveal-item float-ui w-full max-w-md bg-white rounded-[2.5rem] border border-[#00A5D4]/20 shadow-[0_30px_60px_rgba(0,77,64,0.1)] overflow-hidden relative">
            <div className="bg-[#F9F5E7]/80 border-b border-[#00A5D4]/10 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00A5D4]/10 rounded-full flex items-center justify-center text-[#00A5D4] font-bold">
                MR
              </div>
              <div>
                <p className="font-bold text-[#004D40]">Michael Rivera</p>
                <p className="text-[10px] text-[#10B981] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>{" "}
                  Online
                </p>
              </div>
            </div>

            <div className="p-5 space-y-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
              {/* Webchat Message */}
              <div className="flex flex-col gap-1 items-start">
                <div className="flex items-center gap-1.5 ml-1">
                  <Globe size={10} className="text-[#00A5D4]" />
                  <span className="text-[9px] font-bold text-[#00A5D4] uppercase tracking-wider">
                    Webchat • 2:14 PM
                  </span>
                </div>
                <div className="bg-white border border-[#00A5D4]/20 p-3 rounded-2xl rounded-tl-none text-[#004D40] text-sm shadow-sm max-w-[85%]">
                  Hi, I'm looking at your pricing page. Does the Pro tier
                  include onboarding?
                </div>
              </div>

              {/* Team Reply */}
              <div className="flex flex-col gap-1 items-end">
                <div className="flex items-center gap-1.5 mr-1">
                  <span className="text-[9px] font-bold text-[#004D40]/40 uppercase tracking-wider">
                    Sarah (Team) • 2:18 PM
                  </span>
                  <User size={10} className="text-[#004D40]/40" />
                </div>
                <div className="bg-[#00A5D4] p-3 rounded-2xl rounded-tr-none text-white text-sm shadow-sm max-w-[85%]">
                  Hey Michael! Yes, the Pro tier includes a dedicated 45-minute
                  onboarding call with our team.
                </div>
              </div>

              {/* SMS Message (Later that day) */}
              <div className="flex flex-col gap-1 items-start mt-6">
                <div className="flex items-center gap-1.5 ml-1">
                  <Smartphone size={10} className="text-[#FF6F61]" />
                  <span className="text-[9px] font-bold text-[#FF6F61] uppercase tracking-wider">
                    SMS • 8:45 PM
                  </span>
                </div>
                <div className="bg-white border border-[#00A5D4]/20 p-3 rounded-2xl rounded-tl-none text-[#004D40] text-sm shadow-sm max-w-[85%]">
                  Just signed up! How do I schedule that onboarding call?
                </div>
              </div>

              {/* AI Bot Reply (After hours) */}
              <div className="flex flex-col gap-1 items-end">
                <div className="flex items-center gap-1.5 mr-1">
                  <span className="text-[9px] font-bold text-[#10B981] uppercase tracking-wider">
                    AI Assistant • 8:46 PM
                  </span>
                  <Bot size={10} className="text-[#10B981]" />
                </div>
                <div className="bg-[#10B981]/10 border border-[#10B981]/20 p-3 rounded-2xl rounded-tr-none text-[#004D40] text-sm shadow-sm max-w-[85%]">
                  Welcome aboard, Michael! 🎉 You can pick a time that works for
                  you right here: cal.link/onboarding
                </div>
              </div>
            </div>

            <div className="p-3 bg-white border-t border-[#00A5D4]/10">
              <div className="bg-[#F9F5E7] rounded-full p-2 pl-4 flex items-center justify-between border border-[#00A5D4]/10">
                <span className="text-xs text-[#004D40]/40">
                  Reply to Michael...
                </span>
                <div className="w-8 h-8 rounded-full bg-[#00A5D4] flex items-center justify-center shadow-sm">
                  <Send size={14} className="text-white ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            One thread per contact, no matter the{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              channel
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              A client texts your business number. Then they message through
              your website chat. Then your AI chatbot handles a missed call at
              9pm. In most setups, that's three separate conversations in three
              separate places.
            </p>
            <p>
              SurfBloom merges everything into one thread per contact. Open the
              conversation and you see the entire history — every channel, every
              message, in order.
            </p>
            <p className="font-semibold text-[#004D40]">
              Your team responds from the same place regardless of how the
              client reached out. The client doesn't know the difference. They
              just know you responded.
            </p>
          </div>
        </div>
      </section>

      {/* IMMERSIVE BREAK SECTION: Perfect Harmony */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#FF8A7A] to-[#FF6F61] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(255,111,97,0.3)]">
        {/* Soft Coastal Sunset Background */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=2000"
            alt="Smooth ocean waves at sunset"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-[#F9F5E7]/20 rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#004D40] font-bold flex flex-col md:flex-row items-center justify-center">
            Perfect
            <span className="sb-font-great-vibes italic text-[#F9F5E7] font-normal text-6xl md:text-9xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-sm">
              Harmony.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7]/90 font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            When all your channels flow into a single stream, no one gets left
            on read.
          </p>
        </div>
      </section>

      {/* SECTION 2: Team Visibility */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Everyone sees it. No one{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              double-replies.
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              The worst thing a client can hear is "sorry, I didn't see that" —
              or worse, get the same answer from two different people five
              minutes apart.
            </p>
            <p>
              SurfBloom's inbox is shared across your team. Everyone sees which
              conversations are open, who responded last, and when. No ownership
              confusion, no "I thought you were handling that."
            </p>
            <p className="font-semibold text-[#004D40]">
              A receptionist starts a conversation in the morning, a manager
              picks it up after lunch — the thread is right there, no handoff
              needed. Every message ties back to the contact record so context
              is one click away.
            </p>
          </div>
        </div>

        {/* CSS Mockup: Team Inbox View */}
        <div className="reveal-item relative flex justify-center">
          <div className="w-full max-w-lg bg-white rounded-[2rem] border border-[#00A5D4]/20 shadow-[0_30px_60px_rgba(0,77,64,0.15)] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-[#00A5D4]/10 bg-[#F9F5E7]/50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#004D40] font-bold">
                <Users size={18} className="text-[#00A5D4]" /> Shared Inbox
              </div>
              <div className="flex gap-1">
                <div className="w-6 h-6 rounded-full bg-[#00A5D4]/20 border border-white -mr-2 relative z-20 flex items-center justify-center text-[8px] font-bold text-[#00A5D4]">
                  JS
                </div>
                <div className="w-6 h-6 rounded-full bg-[#FF6F61]/20 border border-white -mr-2 relative z-10 flex items-center justify-center text-[8px] font-bold text-[#FF6F61]">
                  MR
                </div>
                <div className="w-6 h-6 rounded-full bg-[#10B981]/20 border border-white flex items-center justify-center text-[8px] font-bold text-[#10B981]">
                  AL
                </div>
              </div>
            </div>

            {/* Inbox List */}
            <div className="flex flex-col">
              {/* Unread Message */}
              <div className="p-4 border-b border-[#00A5D4]/5 bg-white hover:bg-[#F9F5E7]/50 cursor-pointer flex gap-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF6F61]"></div>
                <div className="w-10 h-10 rounded-full bg-[#00A5D4]/10 flex items-center justify-center text-[#00A5D4] font-bold shrink-0">
                  TK
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-sm font-bold text-[#004D40] truncate">
                      Tom Kendall
                    </p>
                    <p className="text-[10px] text-[#FF6F61] font-bold whitespace-nowrap">
                      2m ago
                    </p>
                  </div>
                  <p className="text-xs text-[#004D40] font-semibold truncate">
                    Can we reschedule for tomorrow?
                  </p>
                </div>
              </div>

              {/* Handled Message */}
              <div className="p-4 border-b border-[#00A5D4]/5 bg-[#F9F5E7]/30 hover:bg-[#F9F5E7]/80 cursor-pointer flex gap-3">
                <div className="w-10 h-10 rounded-full bg-[#004D40]/5 flex items-center justify-center text-[#004D40]/60 font-bold shrink-0">
                  SJ
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-sm font-bold text-[#004D40]/70 truncate">
                      Sarah Jenkins
                    </p>
                    <p className="text-[10px] text-[#004D40]/40 whitespace-nowrap">
                      1h ago
                    </p>
                  </div>
                  <p className="text-xs text-[#004D40]/50 truncate">
                    Thanks for the update.
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#00A5D4]/20 flex items-center justify-center text-[5px] font-bold text-[#00A5D4]">
                      JS
                    </div>
                    <p className="text-[9px] text-[#004D40]/40 font-semibold uppercase tracking-wider">
                      Replied by Jess
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Conversation showing Context */}
              <div className="p-4 bg-white hover:bg-[#F9F5E7]/50 cursor-pointer flex gap-3 relative">
                <div className="w-10 h-10 rounded-full bg-[#FF6F61]/10 flex items-center justify-center text-[#FF6F61] font-bold shrink-0">
                  EV
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-sm font-bold text-[#004D40] truncate">
                      Elena V.
                    </p>
                    <p className="text-[10px] text-[#004D40]/40 whitespace-nowrap">
                      Yesterday
                    </p>
                  </div>
                  <p className="text-xs text-[#004D40]/50 truncate">
                    I'll check the portal now.
                  </p>

                  {/* CRM Context Snippet */}
                  <div className="mt-3 p-2 bg-[#F9F5E7] rounded-lg border border-[#00A5D4]/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-[#00A5D4]" />
                      <span className="text-[10px] font-bold text-[#004D40]">
                        VIP Client
                      </span>
                    </div>
                    <span className="text-[9px] font-bold bg-[#10B981]/10 text-[#10B981] px-1.5 py-0.5 rounded">
                      Active Deal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Connected to Everything */}
      <section className="scroll-section relative py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#00A5D4]/20 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative h-[450px] flex items-center justify-center">
          <div className="relative z-10 flex flex-col items-center w-full max-w-md">
            {/* The Trigger Message */}
            <div className="w-full flex justify-end mb-6 relative z-20">
              <div className="bg-white border border-[#00A5D4]/20 p-4 rounded-2xl rounded-tr-none shadow-lg text-[#004D40] text-sm relative group w-[80%]">
                <span className="absolute -top-3 -right-2 text-[10px] font-bold text-[#00A5D4] bg-[#F9F5E7] px-2 py-0.5 rounded-full shadow-sm border border-[#00A5D4]/10">
                  Client SMS
                </span>
                "Yes, I'd like to book the afternoon slot!"
              </div>
            </div>

            {/* Connecting Visuals */}
            <div className="flex flex-col items-center -mt-2 z-10">
              <div className="w-0.5 h-10 bg-gradient-to-b from-[#00A5D4]/30 to-[#10B981]"></div>
              <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] z-20 -my-2">
                <Zap size={14} className="text-white" />
              </div>
              <div className="w-0.5 h-8 bg-gradient-to-b from-[#10B981] to-[#00A5D4]/20"></div>
            </div>

            {/* The Automated Results */}
            <div className="w-[90%] bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-[#10B981]/20 shadow-xl flex flex-col gap-3 relative z-20">
              <p className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest border-b border-[#10B981]/10 pb-2 mb-1">
                Workflow Triggered
              </p>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#004D40]/5 flex items-center justify-center shrink-0">
                  <User size={12} className="text-[#004D40]" />
                </div>
                <p className="text-xs font-semibold text-[#004D40]">
                  Contact stage updated to{" "}
                  <span className="text-[#10B981] bg-[#10B981]/10 px-1 rounded">
                    Booked
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#004D40]/5 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={12} className="text-[#004D40]" />
                </div>
                <p className="text-xs font-semibold text-[#004D40]">
                  Task created for front desk
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00A5D4]/10 flex items-center justify-center shrink-0">
                  <MessageSquare size={12} className="text-[#00A5D4]" />
                </div>
                <p className="text-xs font-semibold text-[#004D40]">
                  Confirmation SMS queued
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Conversations that trigger what comes{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              next
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              A conversation isn't just words on a screen — it's a signal. A
              client replies "yes" to a booking confirmation and a workflow
              creates the task.
            </p>
            <p>
              Someone asks about pricing through webchat and the chatbot
              captures their info, creates the contact, and enrolls them in a
              follow-up sequence. A negative reply triggers an alert to your
              manager.
            </p>
            <p className="font-semibold text-[#004D40]">
              SurfBloom conversations aren't siloed in an inbox — they're
              connected to your workflows, tasks, and contact records. Every
              message can kick off the next step automatically so your team
              handles the relationship and the system handles the logistics.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
