"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Star,
  MessageSquare,
  Clock,
  CheckCircle2,
  ArrowRight,
  Zap,
  Smartphone,
  Split,
  ThumbsUp,
  ThumbsDown,
  Trophy,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ReviewsPage() {
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
        {/* Layer 1: Clean/Upbeat Overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.06] mix-blend-multiply pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=2000')",
          }}
        />

        {/* Layer 2: Modern Grid Fade */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#004D401A_1px,transparent_1px),linear-gradient(to_bottom,#004D401A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto pt-40 md:pt-48 pb-20">
          <div className="hero-elem inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-[#FF6F61]/20 text-[#FF6F61] font-bold text-sm mb-10 shadow-sm">
            <Trophy size={18} />
            <span className="tracking-wide uppercase text-[#004D40]">
              Reputation Management
            </span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-8xl font-bold text-[#004D40] leading-[1.05] mb-8 tracking-tight drop-shadow-sm">
            The businesses with the most reviews win.{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] font-normal pr-4">
              Period.
            </span>
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/75 leading-relaxed max-w-4xl mx-auto font-medium">
            Google ranks you by quantity, recency, and rating. SurfBloom
            automates the ask after every visit so reviews come in consistently
            without your team remembering to send a single one.
          </p>
        </div>
      </section>

      {/* SECTION 1: Automated Asking */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative flex justify-center">
          {/* CSS Mockup: Automated Chat Flow */}
          <div className="reveal-item float-ui w-full max-w-sm bg-white rounded-[3rem] border-8 border-[#004D40] shadow-[0_30px_60px_rgba(0,77,64,0.15)] overflow-hidden relative h-[550px] flex flex-col">
            {/* Phone Header */}
            <div className="bg-[#F9F5E7] p-4 text-center border-b border-[#00A5D4]/10 pt-6">
              <p className="font-bold text-[#004D40] text-sm">David Miller</p>
              <p className="text-[#10B981] text-[10px] font-bold uppercase tracking-wider">
                SMS Thread
              </p>
            </div>

            {/* Chat Content */}
            <div className="flex-grow p-5 space-y-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5 relative">
              {/* Automated Ask */}
              <div className="flex flex-col gap-1 items-end">
                <div className="flex items-center gap-1.5 mr-1">
                  <span className="text-[9px] font-bold text-[#004D40]/40 uppercase tracking-wider">
                    Automated • 2:00 PM
                  </span>
                  <Zap size={10} className="text-[#00A5D4]" />
                </div>
                <div className="bg-[#00A5D4] p-3 rounded-2xl rounded-tr-none text-white text-sm shadow-sm max-w-[90%]">
                  Hi David! Thanks for trusting us with your AC repair today. If
                  Mike did a great job, we'd love a quick Google review! ⭐
                  review.link/pro-hvac
                </div>
              </div>

              {/* Review Intercept / Notification Overlay */}
              <div className="my-6 relative z-20">
                <div className="bg-white border border-[#FF6F61]/20 rounded-2xl p-4 shadow-lg text-center transform scale-105 border-t-4 border-t-[#FF6F61]">
                  <div className="flex justify-center gap-1 text-[#FF6F61] mb-2">
                    <Star size={16} className="fill-current" />
                    <Star size={16} className="fill-current" />
                    <Star size={16} className="fill-current" />
                    <Star size={16} className="fill-current" />
                    <Star size={16} className="fill-current" />
                  </div>
                  <p className="text-xs font-bold text-[#004D40]">
                    New 5-Star Review Received!
                  </p>
                  <p className="text-[10px] text-[#004D40]/60 mt-1">
                    "Mike was fast, friendly, and fixed the AC in 20 mins."
                  </p>
                </div>
              </div>

              {/* Automated Thank You */}
              <div className="flex flex-col gap-1 items-end opacity-90">
                <div className="flex items-center gap-1.5 mr-1">
                  <span className="text-[9px] font-bold text-[#004D40]/40 uppercase tracking-wider">
                    Automated • 4:15 PM
                  </span>
                  <Zap size={10} className="text-[#00A5D4]" />
                </div>
                <div className="bg-[#00A5D4] p-3 rounded-2xl rounded-tr-none text-white text-sm shadow-sm max-w-[90%]">
                  Thanks so much for the amazing review, David! We'll pass the
                  kind words on to Mike. See you next time! 🛠️
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Every client gets asked. Right on{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              time.
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              The number one reason businesses don't have enough reviews is that
              nobody asks. Your team is busy, they forget, it feels awkward.
              SurfBloom removes all of it.
            </p>
            <p>
              When a client opts into your messaging, a workflow handles the
              rest — a personalized text goes out after their visit with a
              direct link to your Google review page. AI writes the message
              using the client's name and the service they received so it reads
              like a personal follow-up, not a mass blast.
            </p>
            <p className="font-semibold text-[#004D40]">
              Didn't leave a review after five days? A gentle nudge goes out
              automatically. Left one? A thank-you message fires. You set it up
              once and the system handles the asking for you.
            </p>
          </div>
        </div>
      </section>

      {/* IMMERSIVE BREAK SECTION: Local Dominance */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#FFD54F] to-[#FF8A7A] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(255,111,97,0.3)]">
        {/* Sunlit City Skyline Background */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.pexels.com/photos/313782/pexels-photo-313782.jpeg?auto=compress&cs=tinysrgb&w=2000"
            alt="Beautiful sunlit city skyline"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#F9F5E7]/30 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#004D40] font-bold flex flex-col md:flex-row items-center justify-center drop-shadow-sm">
            Own your
            <span className="sb-font-great-vibes italic text-[#F9F5E7] font-normal text-6xl md:text-9xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-md">
              market.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#004D40]/90 font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            Stop losing customers to competitors with lower quality but higher
            review counts. Let your actual service speak for itself online.
          </p>
        </div>
      </section>

      {/* SECTION 2: Timing That Actually Works */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Ask when they're happiest, not when you{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              remember
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              A review request sent two weeks after a visit gets ignored. One
              sent while the client is still in your parking lot feels pushy.
            </p>
            <p>
              SurfBloom lets you dial in the exact timing — one hour after
              checkout, the next morning, end of business day — whatever window
              works best for your industry. Workflows control the delay down to
              the minute.
            </p>
            <div className="p-6 rounded-3xl bg-white border border-[#00A5D4]/15 shadow-sm text-left relative overflow-hidden mt-8">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00A5D4]"></div>
              <p className="font-semibold text-[#004D40]">
                Because it's tied to your contact record, the system knows who's
                already been asked, who responded, and who needs a follow-up. No
                double-sends, no missed opportunities, no spreadsheet tracking.
              </p>
            </div>
          </div>
        </div>

        {/* CSS Mockup: Workflow Timeline */}
        <div className="reveal-item relative flex justify-center py-8">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-[#00A5D4]/20 shadow-[0_30px_60px_rgba(0,77,64,0.15)] p-8">
            <div className="flex items-center gap-2 mb-8 border-b border-[#00A5D4]/10 pb-4">
              <Zap size={18} className="text-[#FF6F61]" />
              <h3 className="font-bold text-[#004D40] text-lg">
                Smart Review Flow
              </h3>
            </div>

            <div className="relative flex flex-col items-center">
              {/* Trigger */}
              <div className="bg-[#10B981]/10 border border-[#10B981]/30 p-3 rounded-xl w-[80%] flex items-center justify-center gap-2 shadow-sm z-10">
                <CheckCircle2 size={16} className="text-[#10B981]" />
                <span className="text-sm font-bold text-[#004D40]">
                  Visit Completed
                </span>
              </div>

              {/* Delay 1 */}
              <div className="w-0.5 h-8 bg-[#00A5D4]/20 relative"></div>
              <div className="bg-[#F9F5E7] text-[#004D40]/70 text-[10px] font-bold px-3 py-1 rounded-full border border-[#00A5D4]/10 flex items-center gap-1 z-10 -my-3">
                <Clock size={10} /> Wait 2 Hours
              </div>
              <div className="w-0.5 h-8 bg-[#00A5D4]/20 relative"></div>

              {/* Action 1 */}
              <div className="bg-white border border-[#00A5D4]/30 p-3 rounded-xl w-[80%] flex items-center justify-center gap-2 shadow-md z-10">
                <MessageSquare size={16} className="text-[#00A5D4]" />
                <span className="text-sm font-bold text-[#004D40]">
                  Send Review SMS
                </span>
              </div>

              {/* Delay 2 */}
              <div className="w-0.5 h-8 bg-[#00A5D4]/20 relative"></div>
              <div className="bg-[#F9F5E7] text-[#004D40]/70 text-[10px] font-bold px-3 py-1 rounded-full border border-[#00A5D4]/10 flex items-center gap-1 z-10 -my-3">
                <Clock size={10} /> Wait 5 Days
              </div>
              <div className="w-0.5 h-8 bg-[#00A5D4]/20 relative"></div>

              {/* Condition */}
              <div className="bg-[#004D40] text-white p-3 rounded-xl w-[80%] flex flex-col items-center justify-center shadow-md z-10 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Split size={14} className="text-[#FF6F61]" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Condition
                  </span>
                </div>
                <span className="text-sm">Has left a review?</span>
              </div>

              {/* Branching Paths */}
              <div className="flex w-[90%] justify-between relative mt-2">
                {/* Horizontal connector */}
                <div className="absolute top-0 left-[20%] right-[20%] h-0.5 bg-[#00A5D4]/20 -mt-2"></div>

                {/* Yes Path */}
                <div className="flex flex-col items-center w-[45%]">
                  <div className="w-0.5 h-4 bg-[#00A5D4]/20 -mt-2 mb-1"></div>
                  <span className="text-[10px] font-bold text-[#10B981] mb-2 bg-[#10B981]/10 px-2 py-0.5 rounded">
                    YES
                  </span>
                  <div className="bg-white border border-[#10B981]/30 p-2 rounded-lg w-full text-center shadow-sm">
                    <span className="text-[10px] font-bold text-[#004D40] flex items-center justify-center gap-1">
                      <ThumbsUp size={10} className="text-[#10B981]" /> Thank
                      You SMS
                    </span>
                  </div>
                </div>

                {/* No Path */}
                <div className="flex flex-col items-center w-[45%]">
                  <div className="w-0.5 h-4 bg-[#00A5D4]/20 -mt-2 mb-1"></div>
                  <span className="text-[10px] font-bold text-[#FF6F61] mb-2 bg-[#FF6F61]/10 px-2 py-0.5 rounded">
                    NO
                  </span>
                  <div className="bg-white border border-[#FF6F61]/30 p-2 rounded-lg w-full text-center shadow-sm">
                    <span className="text-[10px] font-bold text-[#004D40] flex items-center justify-center gap-1">
                      <MessageSquare size={10} className="text-[#FF6F61]" />{" "}
                      Follow-up Nudge
                    </span>
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
