"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Kanban,
  CalendarDays,
  TableProperties,
  MessageCircle,
  Link2,
  CheckCircle2,
  Workflow,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type ViewPreview = "kanban" | "calendar" | "table";

export default function TasksPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewPreview, setViewPreview] = useState<ViewPreview>("kanban");

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

      // Lagoon impact section text reveal
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
        {/* Layer 1: Tropical Palm Shadows */}
        <div
          className="absolute inset-0 z-0 opacity-[0.05] mix-blend-multiply pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1615800098779-1be32e71225c?auto=format&fit=crop&w=2000&q=80')",
          }}
        />

        {/* Layer 2: Modern Grid Fade */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#004D401A_1px,transparent_1px),linear-gradient(to_bottom,#004D401A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto pt-40 md:pt-48 pb-20">
          <h1 className="hero-elem sb-font-playfair text-6xl md:text-8xl font-bold text-[#004D40] leading-[1.05] mb-8 tracking-tight drop-shadow-sm">
            Every follow-up, every handoff — tracked in{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] font-normal pr-4">
              one place
            </span>
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/75 leading-relaxed max-w-4xl mx-auto font-medium">
            Table, Kanban, or Calendar — pick the view that fits how you work.
            Every task links to the contact, review, or conversation that
            created it. Nothing falls through the cracks because nothing lives
            in your head anymore.
          </p>
        </div>
      </section>

      {/* SECTION 1: Three Views, One Board */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-8">
            See your work the way you{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              think
            </span>
          </h2>
          <p className="reveal-item text-[#004D40]/75 text-lg leading-relaxed">
            Some people need rows and columns. Others need cards they can drag.
            Your front desk wants a calendar. SurfBloom gives you all three —
            Table, Kanban, and Calendar — and they all show the same tasks.
            Switch between them without losing anything. Kanban columns match
            your statuses:{" "}
            <span className="font-bold text-[#FF6F61]">Overdue</span>,{" "}
            <span className="font-bold text-[#FF8A7A]">Priority 1</span>,{" "}
            <span className="font-bold text-[#00A5D4]">Priority 2</span>,{" "}
            <span className="font-bold text-[#004D40]">Completed</span>,{" "}
            <span className="font-bold text-[#8B5CF6]">Verified</span>. Drag a
            card from Priority 1 to Completed and it updates everywhere
            instantly. Table view gives you sortable columns, bulk actions, and
            the density you need when you're managing dozens of tasks at once.
            Calendar shows what's due today, what's coming, and what slipped —
            with unscheduled tasks in a sidebar so nothing hides.
          </p>
        </div>

        {/* Multi-View Visual Representation */}
        <div className="reveal-item relative">
          <div className="flex justify-center gap-4 mb-6 relative z-20">
            <button
              type="button"
              onClick={() => setViewPreview("kanban")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold border transition-all ${
                viewPreview === "kanban"
                  ? "bg-white shadow-md text-[#00A5D4] border-[#00A5D4]/20"
                  : "bg-white/60 hover:bg-white text-[#004D40]/60 hover:text-[#00A5D4] border-transparent"
              }`}
            >
              <Kanban size={18} /> Kanban
            </button>
            <button
              type="button"
              onClick={() => setViewPreview("calendar")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold border transition-all ${
                viewPreview === "calendar"
                  ? "bg-white shadow-md text-[#00A5D4] border-[#00A5D4]/20"
                  : "bg-white/60 hover:bg-white text-[#004D40]/60 hover:text-[#00A5D4] border-transparent"
              }`}
            >
              <CalendarDays size={18} /> Calendar
            </button>
            <button
              type="button"
              onClick={() => setViewPreview("table")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold border transition-all ${
                viewPreview === "table"
                  ? "bg-white shadow-md text-[#00A5D4] border-[#00A5D4]/20"
                  : "bg-white/60 hover:bg-white text-[#004D40]/60 hover:text-[#00A5D4] border-transparent"
              }`}
            >
              <TableProperties size={18} /> Table
            </button>
          </div>

          <div className="relative rounded-[3rem] bg-white border border-[#00A5D4]/20 shadow-[0_20px_60px_rgba(0,77,64,0.1)] p-4 overflow-hidden group">
            <div className="absolute inset-0 bg-[#00A5D4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none rounded-[3rem]"></div>

            <Image
              src={
                viewPreview === "calendar"
                  ? "/logos/calendar.png"
                  : viewPreview === "kanban"
                    ? "/logos/kanban.png"
                    : "/logos/table.png"
              }
              alt={
                viewPreview === "calendar"
                  ? "SurfBloom Task Calendar"
                  : viewPreview === "kanban"
                    ? "SurfBloom Kanban Board"
                    : "SurfBloom Task Table"
              }
              width={1200}
              height={700}
              className="w-full h-auto rounded-[2.5rem] object-cover border border-[#004D40]/5"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: Context Built In */}
      <section className="scroll-section relative py-32 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative flex justify-center">
          {/* Stunning CSS Mockup of the Highlighted Task Card */}
          <div className="reveal-item float-ui w-full max-w-md bg-white rounded-[2.5rem] border border-[#00A5D4]/20 shadow-[0_30px_60px_rgba(0,77,64,0.15)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#FF8A7A]"></div>

            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2 bg-[#FF8A7A]/10 text-[#FF8A7A] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <AlertCircle size={14} /> Priority 1
                </div>
                <div className="flex items-center gap-1 text-[#004D40]/40 text-sm font-mono">
                  #3
                </div>
              </div>

              <h3 className="text-2xl font-bold text-[#004D40] mb-4 leading-tight">
                Respond to 2-star review
              </h3>

              <div className="flex flex-wrap gap-2 mb-8">
                <div className="flex items-center gap-2 bg-[#F9F5E7] border border-[#004D40]/10 px-3 py-1.5 rounded-lg text-sm text-[#004D40]/80">
                  <User size={14} className="text-[#00A5D4]" />
                  <span className="font-semibold">John Thompson</span>
                </div>
                <div className="flex items-center gap-2 bg-[#F9F5E7] border border-[#004D40]/10 px-3 py-1.5 rounded-lg text-sm text-[#004D40]/80">
                  <Link2 size={14} className="text-[#FF6F61]" />
                  <span className="font-semibold text-[#00A5D4] hover:underline cursor-pointer">
                    View Review
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#00A5D4]/10 pt-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#004D40] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    AHM
                  </div>
                  <div>
                    <p className="text-xs text-[#004D40]/50 font-bold uppercase tracking-wider">
                      Assignee
                    </p>
                    <p className="text-sm font-semibold text-[#004D40]">
                      Alex H.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#004D40]/50 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                    <Clock size={12} /> Due
                  </p>
                  <p className="text-sm font-semibold text-[#FF6F61]">
                    Today, 5:00 PM
                  </p>
                </div>
              </div>

              <div className="bg-[#F9F5E7]/50 rounded-2xl p-4 border border-[#00A5D4]/10">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={14} className="text-[#00A5D4]" />
                  <span className="text-xs font-bold text-[#004D40]/70 uppercase tracking-wider">
                    Internal Thread
                  </span>
                </div>
                <div className="space-y-3 mt-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#FF6F61] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      SJ
                    </div>
                    <p className="text-sm text-[#004D40]/80 leading-snug">
                      <span className="font-bold">Sarah:</span> Did we call this
                      person back?
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00A5D4] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      AH
                    </div>
                    <p className="text-sm text-[#004D40]/80 leading-snug">
                      <span className="font-bold">Alex:</span> Yes, she's
                      rescheduled for Thursday. Closing this out.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Every task knows why it{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              exists
            </span>{" "}
            — and your team can talk about it
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              A task that says "Follow up" means nothing without context.
              SurfBloom tasks link directly to the contact, review, or
              conversation that created them. Open any task and you see exactly
              who it's about, what they said, and what happened last.
            </p>
            <p>
              Color-coded icons tell you at a glance what type of work it is — a
              location task for the whole business, a contact task tied to a
              specific person, or a review task triggered by feedback.
            </p>
            <p className="font-semibold text-[#004D40]">
              Every task has a built-in message thread where your team discusses
              that specific task — not buried in a group chat, not lost in
              email, not shouted across the office.
            </p>
            <p>
              "Did we call this person back?" "Yes, she's rescheduled for
              Thursday." Right there, attached to the task, visible to everyone
              who needs it. Add categories, assignees, due dates, checklists,
              and related tasks. All the context lives in one place so nobody
              asks "wait, which patient was this for?" ever again.
            </p>
          </div>
        </div>
      </section>

      {/* IMMERSIVE BREAK SECTION: Perfect Visibility (The Lagoon Theme) */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#00A5D4] to-[#007A9E] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(0,165,212,0.25)]">
        {/* Crystal Clear Water Ripples */}
        <div className="absolute inset-0 opacity-30 mix-blend-color-burn pointer-events-none">
          {/* biome-ignore lint/performance/noImgElement: Immersive decorative background */}
          <img
            src="https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=2000&q=80"
            alt="Crystal clear tropical shallows"
            className="h-full w-full object-cover"
          />
        </div>
        {/* Sun Glare Effect representing clarity */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#F9F5E7]/20 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#004D40] font-bold flex flex-col md:flex-row items-center justify-center">
            Perfect
            <span className="sb-font-great-vibes italic text-[#F9F5E7] font-normal text-6xl md:text-9xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-sm">
              Visibility
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7] font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            No more guessing who called back. No more lost sticky notes. Just a
            crystal-clear view of exactly what needs to happen next.
          </p>
        </div>
      </section>

      {/* SECTION 3: Workflows Create Them */}
      <section className="scroll-section relative py-32 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Tasks that assign{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              themselves
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              The real power is that you don't create most of these tasks
              manually. A workflow fires when a 2-star review lands — it creates
              a "Respond to negative review" task, assigns it to the manager,
              sets priority to 1, and links the review.
            </p>
            <p>
              A new contact comes in with no appointment — workflow creates a
              "Schedule consultation" task with a 24-hour deadline.
            </p>
            <p className="font-bold text-[#004D40] text-xl p-6 bg-white rounded-3xl border border-[#00A5D4]/10 shadow-sm relative overflow-hidden mt-8">
              <span className="absolute left-0 top-0 w-1.5 h-full bg-[#00A5D4]"></span>
              Your team opens the board in the morning, and everything they need
              to do is already there, already prioritized, already linked to the
              right person. They just work the board.
            </p>
          </div>
        </div>

        {/* Abstract Workflow to Kanban visualization */}
        <div className="reveal-item relative h-[400px] flex items-center justify-center">
          <div className="absolute inset-0 bg-[#00A5D4]/5 rounded-[3rem] border border-[#00A5D4]/10"></div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* The Trigger */}
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-[#00A5D4]/10 flex items-center gap-4 w-64 transform -translate-x-12">
              <div className="w-10 h-10 rounded-full bg-[#FF8A7A]/10 text-[#FF8A7A] flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-[#004D40]/50 font-bold uppercase">
                  Trigger
                </p>
                <p className="text-sm font-bold text-[#004D40]">
                  2-Star Review Lands
                </p>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="w-1 h-8 bg-gradient-to-b from-[#FF8A7A] to-[#00A5D4] rounded-full"></div>

            {/* The Action Node */}
            <div className="bg-[#004D40] text-white p-4 rounded-2xl shadow-xl border border-[#004D40] flex items-center gap-4 w-64 z-20">
              <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">
                <Workflow size={20} />
              </div>
              <div>
                <p className="text-xs text-white/50 font-bold uppercase">
                  Action
                </p>
                <p className="text-sm font-bold">Create Task</p>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="w-1 h-8 bg-gradient-to-b from-[#00A5D4] to-[#00A5D4] rounded-full"></div>

            {/* The Resulting Task */}
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-[#00A5D4]/20 flex items-center justify-between w-72 transform translate-x-12 relative overflow-hidden">
              <div className="absolute left-0 top-0 w-1 h-full bg-[#FF8A7A]"></div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-[#004D40]/30" />
                <p className="text-sm font-bold text-[#004D40]">
                  Respond to review
                </p>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#004D40] text-white flex items-center justify-center text-[10px] font-bold">
                AH
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
