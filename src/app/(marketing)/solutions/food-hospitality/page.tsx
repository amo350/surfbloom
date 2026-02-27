"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  LayoutList,
  MessageSquare,
  Smartphone,
  Star,
  Utensils,
  Wine,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function FoodHospitalityPage() {
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
        {/* Background Image with Warm Restaurant Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80"
            alt="Busy modern restaurant with warm ambient lighting"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#F9F5E7]/85 mix-blend-soft-light"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F5E7] via-[#F9F5E7]/70 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto pt-32">
          <div className="hero-elem inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-[#00A5D4]/20 text-[#FF6F61] font-bold text-sm mb-8 shadow-sm">
            <Utensils size={18} className="text-[#FF6F61]" />
            <span className="tracking-wide uppercase text-[#004D40]">
              Solutions for Food & Hospitality
            </span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-7xl lg:text-8xl font-bold text-[#004D40] leading-[1.1] mb-8 tracking-tight">
            Full tables start with full{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              inboxes.
            </span>
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/80 leading-relaxed max-w-3xl mx-auto font-medium">
            Reservations, catering inquiries, and "are you open right now?"
            texts don't stop when your kitchen gets slammed. SurfBloom automates
            your guest follow-ups, review collection, and lead responses so you
            never lose a booking because nobody had time to reply.
          </p>
        </div>
      </section>

      {/* SECTION 1: AI Chatbot */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1505826759037-406b40feb4cd?auto=format&fit=crop&w=1200&q=80"
              alt="Empty restaurant after close with warm pendant light"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-[0.8]"
            />
            {/* Glowing AI Chat UI overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white/95 backdrop-blur-md rounded-[2rem] border border-[#00A5D4]/30 shadow-2xl overflow-hidden pb-2">
              <div className="bg-[#004D40] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative">
                  <MessageSquare className="text-white" size={20} />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#004D40]"></div>
                </div>
                <div>
                  <p className="font-bold text-white">Host AI</p>
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <Clock size={10} /> 11:30 PM (Closed)
                  </p>
                </div>
              </div>
              <div className="p-5 space-y-4 bg-[#F9F5E7]">
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  Hi! I was looking to book a table for 8 people for a birthday
                  dinner this Friday. Do you have anything available?
                </div>
                <div className="bg-[#FF6F61]/10 p-3 rounded-xl rounded-tr-none border border-[#FF6F61]/20 text-[#004D40] text-sm max-w-[90%] ml-auto shadow-sm">
                  Happy early birthday! 🎉 We can absolutely accommodate a party
                  of 8. I have availability at 6:00 PM or 8:30 PM this Friday.
                  Would you like me to lock one of those in for you?
                </div>
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  8:30 PM would be perfect!
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
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
              SurfBloom's AI chatbot responds to inquiries, answers questions
              about hours and menus, captures event and catering leads, and
              books reservations.
            </p>
            <p>
              It responds using your restaurant's name, tone, and personality.
              Your guests think they're talking to your host stand. You see the
              full conversation waiting for you before the lunch rush.
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

      {/* SECTION 2: Review Collection */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            More five-star reviews on{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              autopilot
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              The restaurants with the most reviews win local search. When a
              guest opts into your messaging, a workflow handles the rest — a
              personalized text goes out after a visit with a direct link to
              your Google review page.
            </p>
            <p>
              AI writes the message using the guest's name and visit details so
              it reads like a personal follow-up, not a mass blast. Didn't leave
              a review after five days? A gentle nudge goes out automatically.
              Left one? A thank-you message fires.
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
        <div className="relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=1200&q=80"
              alt="Couple laughing outside a restaurant at night"
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
                    Osteria Bella
                  </p>
                  <p className="text-[#004D40]/70 text-xs leading-relaxed mt-1">
                    Hi David! Thank you so much for joining us for dinner
                    tonight. If you enjoyed the pasta, we'd love a quick Google
                    review!
                  </p>
                  <p className="text-[#00A5D4] text-xs font-semibold mt-2">
                    review.link/osteria
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMMERSIVE BREAK SECTION: Perfect Hospitality */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#FF6F61] to-[#D94E40] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(255,111,97,0.3)]">
        {/* Warm Ambient Dining Background */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=2000&q=80"
            alt="Warm restaurant ambiance and bokeh"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-[#F9F5E7]/20 rounded-full blur-[120px] translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#004D40] font-bold flex flex-col md:flex-row items-center justify-center">
            Perfect
            <span className="sb-font-great-vibes italic text-[#F9F5E7] font-normal text-6xl md:text-9xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-sm">
              Hospitality.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7] font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            Great service doesn't end when they walk out the door. Keep the
            relationship warm and turn first-time guests into lifelong regulars.
          </p>
        </div>
      </section>

      {/* SECTION 3: Surveys */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80"
              alt="Restaurant manager standing at the pass looking over the dining room"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Survey UI Overlay */}
            <div className="absolute bottom-[10%] left-[-5%] w-[110%] md:w-[85%] md:left-[7.5%] bg-white/95 backdrop-blur-md rounded-2xl border border-[#00A5D4]/20 shadow-xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-[#00A5D4]">
                  <Wine size={18} />
                  <span className="font-bold text-sm">
                    VIP Anniversary Follow-up
                  </span>
                </div>
                <span className="text-[10px] font-bold text-white bg-[#10B981] px-2 py-1 rounded-md shadow-sm">
                  GUEST RECORD SYNCED
                </span>
              </div>
              <p className="text-[#004D40] font-semibold text-sm">
                How was your anniversary dinner with us?
              </p>
              <div className="flex justify-between items-center bg-[#F9F5E7] p-2 rounded-xl border border-[#00A5D4]/10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <div
                    key={num}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${num === 10 ? "bg-[#FF6F61] text-white shadow-md scale-110" : "bg-white text-[#004D40]/50 border border-gray-200"}`}
                  >
                    {num}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#004D40]/60 italic border-l-2 border-[#FF6F61]/30 pl-2">
                "Incredible! The server brought out complimentary champagne and
                the steak was cooked perfectly. See you next year!"
              </p>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Know what your guests{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              actually
            </span>{" "}
            think
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Send short surveys after visits to catch problems before they
              become bad reviews. Responses flow straight into your CRM — tied
              to the guest, not lost in a comment box.
            </p>
            <p>
              Low score? A workflow can automatically create a follow-up task
              for your manager to reach out and make it right. Track
              satisfaction over time and spot patterns — slow service on
              Fridays, cold food complaints in winter — before they cost you
              regulars.
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

      {/* SECTION 4: Tasks */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Your team's entire to-do list in{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
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
              Each task links to the guest, review, or conversation that created
              it so nobody asks "which catering inquiry was this?" Built-in
              messaging lets your team discuss tasks without shouting across the
              kitchen.
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
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80"
              alt="Restaurant team gathered around a tablet before service"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Kanban Task Overlay */}
            <div className="absolute bottom-[10%] right-[10%] w-[60%] bg-[#F9F5E7]/95 backdrop-blur-md rounded-[2rem] border border-[#004D40]/10 shadow-2xl overflow-hidden p-4 transform rotate-[-2deg]">
              <div className="flex items-center justify-between mb-3 border-b border-[#004D40]/10 pb-2">
                <p className="text-[10px] font-bold text-[#004D40] uppercase flex items-center gap-1">
                  <LayoutList size={12} /> Shift Priorities
                </p>
                <span className="bg-[#FF6F61] text-white text-[8px] px-2 py-0.5 rounded-full font-bold">
                  2 To-Do
                </span>
              </div>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-[#00A5D4]">
                  <p className="text-xs font-bold text-[#004D40] mb-1">
                    Call back Wedding Catering Lead
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[#004D40]/60">
                    <Clock size={10} className="text-[#00A5D4]" /> Due today by
                    4 PM
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-[#FF6F61]">
                  <p className="text-xs font-bold text-[#004D40] mb-1">
                    Follow up on 3-Star Review
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[#004D40]/60">
                    <AlertTriangle size={10} className="text-[#FF6F61]" />{" "}
                    Unassigned
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
