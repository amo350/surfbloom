"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  MessageSquare,
  Dumbbell,
  Activity,
  Clock,
  Smartphone,
  Mail,
  AlertTriangle,
  Star,
  Users,
  CheckCircle2,
  Calendar,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function FitnessWellnessPage() {
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
        {/* Background Image with Energetic Tropical Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=80"
            alt="Bright, modern gym floor with natural light"
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
            <Activity size={18} className="text-[#FF6F61]" />
            <span className="tracking-wide uppercase text-[#004D40]">
              Solutions for Fitness & Wellness
            </span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-7xl lg:text-8xl font-bold text-[#004D40] leading-[1.1] mb-8 tracking-tight">
            Stop losing members to the gym down the{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              street.
            </span>
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/80 leading-relaxed max-w-3xl mx-auto font-medium">
            Most gyms lose members silently — they just stop booking classes.
            SurfBloom automates no-show follow-ups, re-engagement campaigns, and
            review requests so you catch drop-off before it becomes a
            cancellation.
          </p>
        </div>
      </section>

      {/* SECTION 1: Campaigns */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80"
              alt="Gym member checking their phone on a bench between sets"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Re-engagement Campaign Overlay (Updated from Check-ins to Bookings) */}
            <div className="absolute bottom-[10%] right-[5%] w-[90%] md:w-[80%] bg-white/95 backdrop-blur-md rounded-2xl border border-[#00A5D4]/20 shadow-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-3 bg-[#F9F5E7] p-3 rounded-xl border border-[#00A5D4]/10">
                <Clock className="text-[#FF6F61]" size={16} />
                <div className="flex-grow">
                  <p className="text-xs font-bold text-[#004D40]">
                    Trigger: Attendance Drop
                  </p>
                  <p className="text-[10px] text-[#004D40]/60">
                    Zero Classes Booked in 14 Days
                  </p>
                </div>
              </div>
              <div className="flex justify-center -my-1 z-10">
                <div className="bg-[#004D40] text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  Action
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border-2 border-[#00A5D4]/30 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00A5D4]"></div>
                <Smartphone className="text-[#00A5D4]" size={16} />
                <div className="flex-grow pl-1">
                  <p className="text-xs font-bold text-[#004D40]">
                    Re-engagement SMS
                  </p>
                  <p className="text-[10px] text-[#004D40]/70 italic mt-0.5">
                    "Hey Jordan! We missed you in class this week. Book a
                    session by Friday and grab a free smoothie on us! 🥤"
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#00A5D4] bg-[#00A5D4]/10 px-2 py-1 rounded-full whitespace-nowrap">
                  24% Return
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
              Send a re-engagement text to members who haven't booked a session
              in two weeks, automate a welcome series for new signups, or push a
              referral promo to your most active regulars. Every send is tracked
              so you know what landed and what didn't.
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
              questions, captures lead information, and books trial sessions —
              all using your gym's name, tone, and class schedule.
            </p>
            <p>
              Your prospects think they're talking to your front desk. You see
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
              src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80"
              alt="Empty gym at night with moody lighting"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-[0.7] contrast-125"
            />
            {/* Glowing AI Chat UI overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white/95 backdrop-blur-md rounded-3xl border border-[#00A5D4]/30 shadow-2xl overflow-hidden pb-2">
              <div className="bg-[#FF6F61] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
                  <Dumbbell className="text-white" size={20} />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#FF6F61]"></div>
                </div>
                <div>
                  <p className="font-bold text-white">Studio AI</p>
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <Clock size={10} /> 10:30 PM (Closed)
                  </p>
                </div>
              </div>
              <div className="p-5 space-y-4 bg-[#F9F5E7]">
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  Hey, do you guys offer day passes? I want to try out the
                  facility.
                </div>
                <div className="bg-[#FF6F61]/10 p-3 rounded-xl rounded-tr-none border border-[#FF6F61]/20 text-[#004D40] text-sm max-w-[85%] ml-auto shadow-sm">
                  We do! Even better, your first day is completely free. Would
                  you like me to book a complimentary 1-Day Trial for you
                  tomorrow? 💪
                </div>
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  Yeah that sounds awesome.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMMERSIVE BREAK SECTION: Unbroken Momentum */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#FF8A7A] to-[#FF6F61] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(255,111,97,0.3)]">
        {/* Sunrise Active Lifestyle Background */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1502759683299-cdcd6974244f?auto=format&fit=crop&w=2000&q=80"
            alt="Sunrise momentum active lifestyle"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-[#F9F5E7]/20 rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#004D40] font-bold flex flex-col md:flex-row items-center justify-center">
            Unbroken
            <span className="sb-font-great-vibes italic text-[#F9F5E7] font-normal text-6xl md:text-9xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-sm">
              Momentum.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7] font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            Keep your community engaged, active, and loyal without lifting a
            finger. Don't let your best members slip away in silence.
          </p>
        </div>
      </section>

      {/* SECTION 3: Feedback */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80"
              alt="Gym owner attentively watching the gym floor"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-[1.05]"
            />
            {/* Feedback Intercept Overlay */}
            <div className="absolute bottom-[10%] left-[5%] w-[90%] md:w-[75%] bg-white/95 backdrop-blur-md rounded-2xl border-l-4 border-[#FF6F61] shadow-2xl p-4">
              <div className="flex items-center justify-between mb-3 border-b border-[#004D40]/5 pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-[#FF6F61]" />
                  <p className="text-xs font-bold text-[#004D40] uppercase tracking-wider">
                    Private Feedback Captured
                  </p>
                </div>
                <p className="text-[10px] text-[#004D40]/50 font-bold">
                  10 MIN AGO
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
                Sam T. (Morning HIIT)
              </p>
              <p className="text-xs text-[#004D40]/70 italic border-l-2 border-gray-200 pl-2">
                "The 6AM class is getting way too crowded. There weren't enough
                weights for everyone this morning."
              </p>
              <div className="mt-3 flex gap-2">
                <div className="text-[10px] font-bold text-white bg-[#004D40] px-2 py-1 rounded">
                  Task Created
                </div>
                <div className="text-[10px] font-bold text-[#004D40] bg-[#F9F5E7] px-2 py-1 rounded border border-[#004D40]/10">
                  Flagged to Manager
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Catch bad experiences before they go{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              public
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Not every unhappy member leaves a review — most just cancel.
              SurfBloom's feedback system gives them a private channel to tell
              you what went wrong before they tell Google.
            </p>
            <p>
              Dirty locker room, overcrowded class, rude interaction — you hear
              about it first. Negative feedback triggers a workflow — task
              created, team notified, follow-up sent — so you can save the
              membership while there's still a chance.
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
      </section>

      {/* SECTION 4: CRM */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Every member. Every interaction.{" "}
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
              Import your existing member list, capture new leads from web forms
              and QR codes, and tag contacts however makes sense for your
              business. When you open a member's record, you see their entire
              history — not just a name and phone number.
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
              src="https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1200&q=80"
              alt="Gym front desk checking a member in"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Contact Record Overlay (Updated from Check-ins to Classes) */}
            <div className="absolute top-[15%] right-[10%] w-[65%] bg-white/95 backdrop-blur-sm rounded-2xl border border-[#004D40]/10 shadow-2xl p-5">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#00A5D4]/10">
                <div className="w-12 h-12 bg-[#00A5D4]/10 rounded-full flex items-center justify-center text-[#00A5D4] font-bold text-lg">
                  AM
                </div>
                <div>
                  <p className="font-bold text-[#004D40]">Alex M.</p>
                  <p className="text-xs text-[#004D40]/60 flex items-center gap-1">
                    <Users size={10} /> Member since 2023
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] px-2 py-1 rounded-md">
                  Active
                </span>
                <span className="text-[10px] font-bold bg-[#F9F5E7] text-[#004D40]/70 border border-[#004D40]/10 px-2 py-1 rounded-md">
                  Unlimited Classes
                </span>
                <span className="text-[10px] font-bold bg-[#FF8A7A]/10 text-[#FF8A7A] border border-[#FF8A7A]/20 px-2 py-1 rounded-md">
                  At Risk - Dropped Attendance
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#004D40]/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00A5D4]"></div>{" "}
                  Attended Vinyasa Flow (Yesterday, 5:30 PM)
                </div>
                <div className="flex items-center gap-2 text-xs text-[#004D40]/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6F61]"></div>{" "}
                  Replied to Re-engagement SMS
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
