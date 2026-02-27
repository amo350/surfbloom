"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Users,
  Smartphone,
  MessageSquare,
  QrCode,
  Calendar,
  Globe,
  Star,
  CheckCircle2,
  ClipboardList,
  Zap,
  ArrowRight,
  Filter,
  Tag,
  PhoneMissed,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ContactsPage() {
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
        {/* Layer 1: Clean Architectural/Office Overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.08] mix-blend-multiply pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=2000')",
          }}
        />

        {/* Layer 2: Modern Grid Fade */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#004D401A_1px,transparent_1px),linear-gradient(to_bottom,#004D401A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto pt-40 md:pt-48 pb-20">
          <div className="hero-elem inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-[#00A5D4]/20 text-[#00A5D4] font-bold text-sm mb-10 shadow-sm">
            <Users size={18} />
            <span className="tracking-wide uppercase">Contact Management</span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-8xl font-bold text-[#004D40] leading-[1.05] mb-8 tracking-tight drop-shadow-sm">
            Every client. Every message. <br />
            Every review.{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              One record.
            </span>
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/75 leading-relaxed max-w-4xl mx-auto font-medium">
            Your contacts aren't just a list — they're the backbone everything
            else runs on. Every text, review, survey, task, and workflow
            execution ties back to a single record. When you open a name, you
            see the whole story.
          </p>
        </div>
      </section>

      {/* SECTION 1: Contacts That Create Themselves */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative flex justify-center">
          {/* CSS Mockup: Ingestion Flow */}
          <div className="reveal-item float-ui w-full max-w-lg bg-white rounded-[2.5rem] border border-[#00A5D4]/20 shadow-[0_30px_60px_rgba(0,77,64,0.1)] p-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-[#004D40] text-lg">
                Contact Ingestion
              </h3>
              <span className="bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></div>{" "}
                Live
              </span>
            </div>

            <div className="flex gap-6 relative">
              {/* Left Side: Sources */}
              <div className="flex flex-col gap-4 w-1/3 z-10">
                <div className="bg-[#F9F5E7] border border-[#00A5D4]/10 p-2.5 rounded-xl flex items-center gap-2 shadow-sm relative group">
                  <Globe size={14} className="text-[#00A5D4]" />
                  <span className="text-xs font-bold text-[#004D40]">
                    Web Form
                  </span>
                  <div className="absolute top-1/2 -right-6 w-6 h-0.5 bg-[#00A5D4]/30 overflow-hidden">
                    <div className="w-2 h-full bg-[#00A5D4] animate-[flow_2s_linear_infinite]"></div>
                  </div>
                </div>
                <div className="bg-[#F9F5E7] border border-[#FF6F61]/10 p-2.5 rounded-xl flex items-center gap-2 shadow-sm relative">
                  <MessageSquare size={14} className="text-[#FF6F61]" />
                  <span className="text-xs font-bold text-[#004D40]">
                    AI Chatbot
                  </span>
                  <div className="absolute top-1/2 -right-6 w-6 h-0.5 bg-[#FF6F61]/30 overflow-hidden">
                    <div className="w-2 h-full bg-[#FF6F61] animate-[flow_2s_linear_infinite_0.5s]"></div>
                  </div>
                </div>
                <div className="bg-[#F9F5E7] border border-[#10B981]/10 p-2.5 rounded-xl flex items-center gap-2 shadow-sm relative">
                  <Calendar size={14} className="text-[#10B981]" />
                  <span className="text-xs font-bold text-[#004D40]">
                    Booking
                  </span>
                  <div className="absolute top-1/2 -right-6 w-6 h-0.5 bg-[#10B981]/30 overflow-hidden">
                    <div className="w-2 h-full bg-[#10B981] animate-[flow_2s_linear_infinite_1s]"></div>
                  </div>
                </div>
                <div className="bg-[#F9F5E7] border border-[#004D40]/10 p-2.5 rounded-xl flex items-center gap-2 shadow-sm relative">
                  <QrCode size={14} className="text-[#004D40]" />
                  <span className="text-xs font-bold text-[#004D40]">
                    QR Scan
                  </span>
                  <div className="absolute top-1/2 -right-6 w-6 h-0.5 bg-[#004D40]/30 overflow-hidden">
                    <div className="w-2 h-full bg-[#004D40] animate-[flow_2s_linear_infinite_1.5s]"></div>
                  </div>
                </div>
              </div>

              {/* Right Side: Contact List */}
              <div className="flex-grow bg-white border border-[#00A5D4]/20 rounded-2xl shadow-inner p-3 flex flex-col gap-2 relative z-10">
                <div className="bg-[#F9F5E7]/50 p-2 rounded-lg border border-transparent hover:border-[#00A5D4]/30 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-[#004D40]">
                      Sarah Jenkins
                    </p>
                    <p className="text-[9px] text-[#004D40]/50">Added 2m ago</p>
                  </div>
                  <span className="text-[8px] font-bold bg-[#00A5D4]/10 text-[#00A5D4] px-1.5 py-0.5 rounded">
                    Web Form
                  </span>
                </div>
                <div className="bg-[#F9F5E7]/50 p-2 rounded-lg border border-transparent hover:border-[#00A5D4]/30 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-[#004D40]">Mike R.</p>
                    <p className="text-[9px] text-[#004D40]/50">
                      Added 15m ago
                    </p>
                  </div>
                  <span className="text-[8px] font-bold bg-[#FF6F61]/10 text-[#FF6F61] px-1.5 py-0.5 rounded">
                    Chatbot
                  </span>
                </div>
                <div className="bg-[#F9F5E7]/50 p-2 rounded-lg border border-transparent hover:border-[#00A5D4]/30 transition-colors flex justify-between items-center opacity-70">
                  <div>
                    <p className="text-xs font-bold text-[#004D40]">Elena V.</p>
                    <p className="text-[9px] text-[#004D40]/50">Added 1h ago</p>
                  </div>
                  <span className="text-[8px] font-bold bg-[#10B981]/10 text-[#10B981] px-1.5 py-0.5 rounded">
                    Booking
                  </span>
                </div>
                <div className="bg-[#F9F5E7]/50 p-2 rounded-lg border border-transparent hover:border-[#00A5D4]/30 transition-colors flex justify-between items-center opacity-50">
                  <div>
                    <p className="text-xs font-bold text-[#004D40]">David T.</p>
                    <p className="text-[9px] text-[#004D40]/50">Added 3h ago</p>
                  </div>
                  <span className="text-[8px] font-bold bg-[#004D40]/10 text-[#004D40] px-1.5 py-0.5 rounded">
                    QR Scan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Stop entering clients by{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              hand
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              SurfBloom pulls contacts in automatically from the places your
              clients already interact with you. Someone books through your
              scheduling tool — they're a contact. A lead fills out your web
              form — contact.
            </p>
            <p>
              Someone scans a QR code at your front desk, or your AI chatbot
              captures a name and number at 11pm — contact. Every entry tracks
              where they came from so you know which channels are actually
              bringing people in.
            </p>
            <p className="font-semibold text-[#004D40]">
              You open SurfBloom in the morning and your new leads are already
              there, already sourced, already ready for whatever workflow you've
              built.
            </p>
          </div>
        </div>
      </section>

      {/* IMMERSIVE BREAK SECTION: Crystal Clear */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#00A5D4] to-[#007A9E] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(0,165,212,0.3)]">
        {/* Crystal Clear Water Background */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.pexels.com/photos/3122822/pexels-photo-3122822.jpeg?auto=compress&cs=tinysrgb&w=2000"
            alt="Crystal clear tropical ocean water"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-[#F9F5E7]/20 rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#F9F5E7] font-bold flex flex-col md:flex-row items-center justify-center drop-shadow-sm">
            Crystal
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal text-6xl md:text-9xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-md">
              Clear.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7]/90 font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            The record is the source of truth, not someone's memory. Give your
            entire team absolute clarity on every single relationship.
          </p>
        </div>
      </section>

      {/* SECTION 2: Complete History */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            No more "what happened with this{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              person?"
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Open any contact and see everything — every SMS sent, every review
              they left, every survey response, every task created about them,
              every workflow that fired for them.
            </p>
            <p>
              It's all on one timeline, in order, with nothing hiding in another
              app. Your front desk can pull up a name and know exactly where
              things stand without asking three people.
            </p>
            <p className="font-semibold text-[#004D40]">
              New team member starts next week? They open the contact and
              they're caught up.
            </p>
          </div>
        </div>

        {/* Unified Timeline Mockup */}
        <div className="reveal-item relative flex justify-center">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-[#00A5D4]/20 shadow-[0_30px_60px_rgba(0,77,64,0.15)] p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#00A5D4]/10">
              <div className="w-14 h-14 bg-gradient-to-br from-[#00A5D4] to-[#007A9E] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                JD
              </div>
              <div>
                <h3 className="font-bold text-[#004D40] text-xl">
                  James Donovan
                </h3>
                <p className="text-xs text-[#004D40]/60">+1 (555) 019-8372</p>
              </div>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#00A5D4]/30 before:to-transparent">
              {/* Timeline Item: SMS */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-[#00A5D4] text-white shadow shrink-0 absolute -left-[27px]">
                  <MessageSquare size={10} />
                </div>
                <div className="bg-[#F9F5E7] p-3 rounded-xl border border-[#00A5D4]/10 shadow-sm w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#004D40] uppercase">
                      SMS Sent
                    </span>
                    <span className="text-[9px] text-[#004D40]/50">
                      Just now
                    </span>
                  </div>
                  <p className="text-xs text-[#004D40]/80">
                    "Hi James, your appointment is confirmed for tomorrow at 2
                    PM."
                  </p>
                </div>
              </div>

              {/* Timeline Item: Task */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-[#10B981] text-white shadow shrink-0 absolute -left-[27px]">
                  <CheckCircle2 size={10} />
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#10B981]/20 shadow-sm w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#004D40] uppercase">
                      Task Completed
                    </span>
                    <span className="text-[9px] text-[#004D40]/50">
                      Yesterday
                    </span>
                  </div>
                  <p className="text-xs text-[#004D40]/80">
                    <span className="line-through opacity-60">
                      Review onboarding documents
                    </span>
                  </p>
                </div>
              </div>

              {/* Timeline Item: Review */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-[#FF6F61] text-white shadow shrink-0 absolute -left-[27px]">
                  <Star size={10} className="fill-current" />
                </div>
                <div className="bg-[#FF6F61]/5 p-3 rounded-xl border border-[#FF6F61]/20 shadow-sm w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#FF6F61] uppercase">
                      Google Review
                    </span>
                    <span className="text-[9px] text-[#004D40]/50">Oct 12</span>
                  </div>
                  <div className="flex gap-0.5 mb-1 text-[#FF6F61]">
                    <Star size={10} className="fill-current" />
                    <Star size={10} className="fill-current" />
                    <Star size={10} className="fill-current" />
                    <Star size={10} className="fill-current" />
                    <Star size={10} className="fill-current" />
                  </div>
                  <p className="text-xs text-[#004D40]/80 italic">
                    "Fantastic service, highly recommend!"
                  </p>
                </div>
              </div>

              {/* Timeline Item: Workflow */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active opacity-70">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-[#004D40] text-white shadow shrink-0 absolute -left-[27px]">
                  <Zap size={10} />
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#004D40]/10 shadow-sm w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#004D40] uppercase">
                      Workflow Fired
                    </span>
                    <span className="text-[9px] text-[#004D40]/50">Oct 5</span>
                  </div>
                  <p className="text-xs text-[#004D40]/80">
                    Entered{" "}
                    <span className="font-semibold text-[#00A5D4]">
                      New Client Onboarding
                    </span>{" "}
                    sequence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Categories and Stages */}
      <section className="scroll-section relative py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#00A5D4]/20 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative flex justify-center overflow-hidden py-8">
          {/* Kanban / Stages Mockup (Simulating horizontal scroll overflow) */}
          <div className="w-full min-w-[500px] flex gap-4 transform translate-x-12 md:translate-x-0">
            {/* Column 1 */}
            <div className="w-48 bg-[#F9F5E7]/80 rounded-2xl p-3 border border-[#00A5D4]/10 flex flex-col gap-3 shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#004D40] uppercase tracking-wider">
                  New Lead
                </span>
                <span className="text-[10px] bg-white text-[#004D40]/50 px-1.5 rounded-full font-bold shadow-sm">
                  2
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-[#00A5D4]/5 hover:-translate-y-1 transition-transform cursor-pointer">
                <p className="text-sm font-bold text-[#004D40] mb-2">Tom H.</p>
                <span className="text-[9px] font-bold bg-[#FF6F61]/10 text-[#FF6F61] px-2 py-0.5 rounded">
                  HVAC
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-[#00A5D4]/5 hover:-translate-y-1 transition-transform cursor-pointer">
                <p className="text-sm font-bold text-[#004D40] mb-2">
                  A. Miller
                </p>
                <span className="text-[9px] font-bold bg-[#00A5D4]/10 text-[#00A5D4] px-2 py-0.5 rounded">
                  Roof Repair
                </span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="w-48 bg-[#F9F5E7]/80 rounded-2xl p-3 border border-[#00A5D4]/10 flex flex-col gap-3 shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#004D40] uppercase tracking-wider">
                  Booked
                </span>
                <span className="text-[10px] bg-white text-[#004D40]/50 px-1.5 rounded-full font-bold shadow-sm">
                  1
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-[#00A5D4]/5 border-l-4 border-l-[#10B981] hover:-translate-y-1 transition-transform cursor-pointer">
                <p className="text-sm font-bold text-[#004D40] mb-2">
                  Sarah J.
                </p>
                <div className="flex gap-1">
                  <span className="text-[9px] font-bold bg-[#FF6F61]/10 text-[#FF6F61] px-2 py-0.5 rounded">
                    HVAC
                  </span>
                  <span className="text-[9px] font-bold bg-[#004D40]/10 text-[#004D40] px-2 py-0.5 rounded">
                    Referral
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3 (Partially cut off to show continuation) */}
            <div className="w-48 bg-[#F9F5E7]/80 rounded-2xl p-3 border border-[#00A5D4]/10 flex flex-col gap-3 shadow-inner opacity-60">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#004D40] uppercase tracking-wider">
                  Completed
                </span>
                <span className="text-[10px] bg-white text-[#004D40]/50 px-1.5 rounded-full font-bold shadow-sm">
                  8
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-[#00A5D4]/5">
                <p className="text-sm font-bold text-[#004D40] mb-2">Mike R.</p>
                <span className="text-[9px] font-bold bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded">
                  Maintenance
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Organize people the way your business{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              thinks
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Every business groups their clients differently. A contractor
              thinks in job types. A gym thinks in membership tiers. Categories
              let you label contacts however makes sense for you.
            </p>
            <p>
              Customizable stages let you track where each person is in your
              process. New lead, consultation booked, service completed, review
              requested — define the stages once and move people through them
              manually or let workflows do it automatically.
            </p>
            <p className="font-semibold text-[#004D40]">
              Filter your entire contact list by category, stage, or both. Then
              target campaigns, trigger workflows, or pull reports based on
              exactly the slice of people you need.
            </p>
          </div>
        </div>
      </section>

      {/* Global Animation Styles for the Mockups */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes flow {
          0% { transform: translateX(-100%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(300%); opacity: 0; }
        }
      `,
        }}
      />
    </div>
  );
}
