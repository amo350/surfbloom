"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flower2,
  MousePointer2,
  Sparkles,
  Star,
  TreePalm,
  Waves,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import BookDemoModal from "./BookDemoModal";
import IndustryMarquee from "./IndustryMarquee";

gsap.registerPlugin(ScrollTrigger);

type ShuffleCard = {
  id: number;
  text: ReactNode;
};

const WORKFLOW_SLIDES = [
  "/logos/node-workflows2.png",
  "/logos/node-workflows3.png",
];

export default function SurfBloomLanding() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [workflowSlide, setWorkflowSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHeroFlipped, setIsHeroFlipped] = useState(false);
  const [shuffleCards, setShuffleCards] = useState<ShuffleCard[]>([
    { id: 1, text: "New Lead -> AI Text" },
    { id: 2, text: "Review Nudge -> Thank You" },
    {
      id: 3,
      text: (
        <span className="sb-font-great-vibes text-xl italic text-[#004D40]">
          Bloom Score
        </span>
      ),
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShuffleCards((prev) => {
        const next = [...prev];
        const last = next.pop();
        if (last) next.unshift(last);
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline();
      heroTl
        .from(".hero-element", {
          y: 50,
          opacity: 0,
          stagger: 0.15,
          duration: 1.2,
          ease: "power3.out",
        })
        .to(".hero-element", {
          rotate: () => gsap.utils.random(-1, 1),
          y: "+=8",
          yoyo: true,
          repeat: -1,
          duration: 4,
          ease: "sine.inOut",
        });

      ScrollTrigger.create({
        start: "top -50",
        end: 99999,
        toggleClass: { className: "nav-scrolled", targets: ".navbar" },
      });

      gsap.from(".philosophy-text", {
        scrollTrigger: {
          trigger: ".philosophy-section",
          start: "top 70%",
        },
        y: 40,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power2.out",
      });

      gsap.from(".impact-text", {
        scrollTrigger: {
          trigger: ".impact-section",
          start: "top 75%",
        },
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 1.1,
        ease: "power3.out",
      });

      // Protocol stacking: pin each panel (pinSpacing: false so next slides over), then scale/blur as next arrives
      const panels = gsap.utils.toArray<HTMLElement>(".protocol-panel");
      if (panels.length > 0) {
        panels.forEach((panel, index) => {
          ScrollTrigger.create({
            trigger: panel,
            start: "top top",
            pin: true,
            pinSpacing: false,
          });

          const nextPanel = panels[index + 1];
          if (nextPanel) {
            gsap.to(panel, {
              scale: 0.9,
              filter: "blur(20px)",
              opacity: 0.5,
              scrollTrigger: {
                trigger: nextPanel,
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
            });
          }
        });
      }

      const cursorTl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      cursorTl
        .to(".mock-cursor", {
          x: 120,
          y: 80,
          duration: 1.5,
          ease: "power2.inOut",
        })
        .to(".mock-cursor", {
          scale: 0.8,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
        })
        .to(
          ".calendar-slot",
          { backgroundColor: "#00A5D4", color: "#fff", duration: 0.2 },
          "-=0.1",
        )
        .to(".mock-cursor", {
          x: 200,
          y: 150,
          duration: 1,
          ease: "power1.inOut",
        })
        .to(".mock-cursor", { opacity: 0, duration: 0.5 });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="selection:bg-[#FF6F61] selection:text-white">
      <section className="relative flex h-dvh w-full items-center overflow-hidden rounded-b-[4rem] px-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-10 bg-linear-to-t from-[#F9F5E7] via-transparent to-transparent" />
          <Image
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
            alt="Tropical island"
            fill
            className="object-cover object-center scale-105"
            priority
            sizes="100vw"
          />
        </div>

        <div className="relative z-20 grid w-full grid-cols-1 md:grid-cols-2">
          <div className="relative md:justify-self-start">
            <div className="hero-element md:hidden">
              <div className="mx-auto w-full max-w-xl [perspective:1400px]">
                <div
                  className={`relative h-[26rem] transition-transform duration-700 [transform-style:preserve-3d] ${isHeroFlipped ? "[transform:rotateY(180deg)]" : ""}`}
                >
                  <div
                    className={`absolute inset-0 [backface-visibility:hidden] ${isHeroFlipped ? "pointer-events-none" : "pointer-events-auto"}`}
                  >
                    <div className="relative flex h-full flex-col rounded-[3rem] border-2 border-[#00A5D4]/30 bg-[#F9F5E7] px-8 py-10 shadow-[0_20px_50px_rgba(0,77,64,0.12)]">
                      <span className="absolute -top-3 -right-3 h-6 w-6 rounded-full border border-[#00A5D4]/40 bg-[#F9F5E7]" />
                      <span className="absolute -bottom-3 -left-2 h-4 w-4 rounded-full border border-[#FF6F61]/45 bg-[#F9F5E7]" />
                      <span className="absolute top-1/2 -left-4 h-8 w-8 -translate-y-1/2 rounded-full border border-[#00A5D4]/25 bg-[#F9F5E7]" />

                      <h1 className="flex flex-col gap-1">
                        <span
                          className="text-4xl font-bold tracking-tight text-[#FF8A7A]"
                          style={{
                            textShadow:
                              "0 1px 0 rgba(255,255,255,0.65), 0 3px 0 rgba(255,111,97,0.22), 0 10px 20px rgba(255,111,97,0.28)",
                          }}
                        >
                          Workflow Trees -
                        </span>
                        <span className="sb-font-playfair text-5xl font-bold italic text-[#004D40]">
                          built for reputation,
                        </span>
                        <span className="mt-2 flex items-center gap-3 text-3xl font-bold text-[#00A5D4]">
                          powered by AI
                          <Image
                            src="/logos/maui-logo.png"
                            alt="Maui icon"
                            width={50}
                            height={50}
                            className="relative top-[2px] h-10 w-10 object-contain"
                          />
                        </span>
                      </h1>
                      <button
                        type="button"
                        className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#00A5D4]/30 bg-white/85 px-4 py-2 text-sm font-semibold text-[#004D40] shadow-sm backdrop-blur-sm transition-colors hover:text-[#00A5D4]"
                        onClick={() => setIsHeroFlipped(true)}
                      >
                        Flip to Workflow Preview
                      </button>
                    </div>
                  </div>

                  <div
                    className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] ${isHeroFlipped ? "pointer-events-auto" : "pointer-events-none"}`}
                  >
                    <div className="relative h-full rounded-[3rem] border-2 border-[#00A5D4]/25 bg-[#F9F5E7] p-4 shadow-[0_20px_50px_rgba(0,77,64,0.12)]">
                      <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-[#00A5D4]/20 shadow-[0_25px_55px_rgba(0,0,0,0.16)]">
                        {WORKFLOW_SLIDES.map((src, i) => (
                          <Image
                            key={src}
                            src={src}
                            alt="SurfBloom workflow screenshot"
                            width={1200}
                            height={900}
                            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ${workflowSlide === i ? "opacity-100" : "opacity-0"}`}
                            priority
                            sizes="100vw"
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setWorkflowSlide(
                            (i) =>
                              (i - 1 + WORKFLOW_SLIDES.length) %
                              WORKFLOW_SLIDES.length,
                          )
                        }
                        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-1.5 text-[#004D40]/55"
                        aria-label="Previous workflow screenshot"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setWorkflowSlide(
                            (i) => (i + 1) % WORKFLOW_SLIDES.length,
                          )
                        }
                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-1.5 text-[#004D40]/55"
                        aria-label="Next workflow screenshot"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#00A5D4]/30 bg-white/85 px-4 py-2 text-sm font-semibold text-[#004D40] shadow-sm backdrop-blur-sm transition-colors hover:text-[#00A5D4]"
                        onClick={() => setIsHeroFlipped(false)}
                      >
                        Show Headline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-element relative hidden max-w-xl rounded-[3rem] border-2 border-[#00A5D4]/30 bg-[#F9F5E7] px-8 py-10 shadow-[0_20px_50px_rgba(0,77,64,0.12)] md:block">
              <span className="absolute -top-3 -right-3 h-6 w-6 rounded-full border border-[#00A5D4]/40 bg-[#F9F5E7]" />
              <span className="absolute -bottom-3 -left-2 h-4 w-4 rounded-full border border-[#FF6F61]/45 bg-[#F9F5E7]" />
              <span className="absolute top-1/2 -left-4 h-8 w-8 -translate-y-1/2 rounded-full border border-[#00A5D4]/25 bg-[#F9F5E7]" />

              <h1 className="flex flex-col gap-1">
                <span
                  className="text-4xl font-bold tracking-tight text-[#FF8A7A] md:text-5xl"
                  style={{
                    textShadow:
                      "0 1px 0 rgba(255,255,255,0.65), 0 3px 0 rgba(255,111,97,0.22), 0 10px 20px rgba(255,111,97,0.28)",
                  }}
                >
                  Workflow Trees -
                </span>
                <span className="sb-font-playfair text-5xl font-bold italic text-[#004D40] md:text-6xl">
                  built for reputation,
                </span>
                <span className="mt-2 flex items-center gap-3 text-3xl font-bold text-[#00A5D4] md:text-4xl">
                  powered by AI
                  <Image
                    src="/logos/maui-logo.png"
                    alt="Maui icon"
                    width={50}
                    height={50}
                    className="relative top-[2px] h-10 w-10 object-contain"
                  />
                </span>
              </h1>
            </div>
            <div className="hero-element relative mx-auto mt-4 max-w-lg rounded-2xl border border-[#00A5D4]/15 bg-[#F9F5E7]/90 px-5 py-3 text-center shadow-[0_8px_24px_rgba(0,77,64,0.08)]">
              <p className="text-sm font-semibold text-[#004D40]/80 md:text-base">
                Automate your reviews, follow-ups, and tasks in one visual
                system. Watch every message send itself while you run your
                business.
              </p>
            </div>
            <div className="hero-element mt-4 flex justify-center">
              <button
                type="button"
                className="btn-magnetic z-10 rounded-full border-2 border-[#00A5D4]/25 bg-white/20 px-5 py-2 backdrop-blur-sm hover:text-white"
                onClick={() => setIsModalOpen(true)}
              >
                Catch the Wave
              </button>
            </div>
          </div>
          <div className="hidden md:flex md:items-center md:justify-center md:pl-8">
            <div className="hero-element relative w-full max-w-xl rounded-[3rem] border-2 border-[#00A5D4]/25 bg-[#F9F5E7] p-4 shadow-[0_20px_50px_rgba(0,77,64,0.12)]">
              <div className="aspect-[4/3.3] relative w-full overflow-hidden rounded-[2rem] border border-[#00A5D4]/20 shadow-[0_25px_55px_rgba(0,0,0,0.16)]">
                {WORKFLOW_SLIDES.map((src, i) => (
                  <Image
                    key={src}
                    src={src}
                    alt="SurfBloom workflow screenshot"
                    width={1200}
                    height={900}
                    className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ${workflowSlide === i ? "opacity-100" : "opacity-0"}`}
                    priority
                    sizes="(max-width: 768px) 100vw, 36rem"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setWorkflowSlide(
                    (i) =>
                      (i - 1 + WORKFLOW_SLIDES.length) % WORKFLOW_SLIDES.length,
                  )
                }
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-1.5 text-[#004D40]/25"
                aria-label="Previous workflow screenshot"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setWorkflowSlide((i) => (i + 1) % WORKFLOW_SLIDES.length)
                }
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-1.5 text-[#004D40]/25"
                aria-label="Next workflow screenshot"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <p className="hero-element sb-font-great-vibes absolute bottom-8 left-1/2 z-30 w-max -translate-x-1/2 -rotate-2 text-5xl text-center text-[#FF6F61]">
          They Surf, You{" "}
          <span className="sb-font-great-vibes font-normal italic text-[#FF6F61]">
            Bloom
          </span>
        </p>
      </section>

      <IndustryMarquee />

      <section
        id="features"
        className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-12 py-32 md:grid-cols-3"
      >
        <div className="flex h-96 flex-col justify-between rounded-[3rem] border border-[#00A5D4]/10 bg-white p-8 shadow-sm">
          <div>
            <h3 className="sb-font-playfair mb-2 text-2xl font-bold">
              Workflow Intelligence
            </h3>
            <p className="text-sm opacity-70">
              Automated sequences that catch perfect{" "}
              <span className="sb-font-great-vibes text-lg italic">waves</span>.
            </p>
          </div>
          <div className="relative h-48 w-full perspective-[1000px]">
            {shuffleCards.map((card, i) => (
              <div
                key={card.id}
                className="sb-font-roboto-mono absolute w-full rounded-2xl border border-[#004D40]/10 bg-[#F9F5E7] p-4 text-center text-sm shadow-sm transition-all duration-700"
                style={{
                  top: `${i * 20}px`,
                  scale: 1 - i * 0.05,
                  opacity: 1 - i * 0.2,
                  zIndex: 10 - i,
                  transform: `translateY(${i === 0 ? "0" : "10px"})`,
                }}
              >
                {card.text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex h-96 flex-col justify-between overflow-hidden rounded-[3rem] bg-[#004D40] p-8 text-white shadow-sm">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <TreePalm size={200} />
          </div>
          <div>
            <h3 className="sb-font-playfair mb-2 text-2xl font-bold text-[#F9F5E7]">
              AI Stream
            </h3>
            <p className="text-sm opacity-70">
              Real-time{" "}
              <span className="sb-font-great-vibes text-lg italic text-[#FF6F61]">
                breeze
              </span>{" "}
              monitoring.
            </p>
          </div>
          <div className="sb-font-roboto-mono rounded-3xl border border-white/10 bg-black/30 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 text-[#00A5D4]">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#FF6F61]" />{" "}
              Live Flow
            </div>
            <p>
              &gt; Drafting personalized review request
              <span className="animate-pulse text-[#FF6F61]">_</span>
            </p>
          </div>
        </div>

        <div className="flex h-96 flex-col justify-between rounded-[3rem] border border-[#00A5D4]/10 bg-white p-8 shadow-sm">
          <div>
            <h3 className="sb-font-playfair mb-2 text-2xl font-bold">
              Adaptive Reception
            </h3>
            <p className="text-sm opacity-70">
              Booking slots that{" "}
              <span className="sb-font-great-vibes text-lg italic text-[#FF6F61]">
                bloom
              </span>{" "}
              effortlessly.
            </p>
          </div>
          <div className="relative rounded-3xl border border-gray-100 bg-[#F9F5E7]/50 p-4">
            <div className="sb-font-roboto-mono mb-2 grid grid-cols-7 gap-1 text-center text-xs font-bold">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={`slot-${i}`}
                  className={`h-8 rounded-lg ${i === 10 ? "calendar-slot bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
            <MousePointer2 className="mock-cursor absolute top-0 left-0 h-6 w-6 text-[#FF6F61] drop-shadow-md" />
          </div>
        </div>
      </section>

      {/* THE CONSOLIDATION SECTION: Stop Managing Tools */}
      <section className="scroll-section relative pt-16 md:pt-20 pb-32 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: The Narrative */}
        <div className="order-1">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-[#004D40] mb-6 leading-tight">
            Stop managing tools.
            <br />
            Start managing{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              growth.
            </span>
          </h2>

          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p className="font-bold text-xl text-[#00A5D4]">
              When your tools don't talk, customers slip.
            </p>
            <p>
              Too many tools. Not enough connection. SurfBloom replaces the
              patchwork of software local businesses duct-tape together.
            </p>
            <p>
              A new client books an appointment and opts into updates —
              SurfBloom automatically sends the confirmation, follows up after
              the visit, requests a review, and thanks them if they leave one.
              Every step stays linked, visible, and automated through visual
              workflows you control.
            </p>
          </div>
        </div>

        {/* Right Side: Before & After Visual */}
        <div className="order-2 reveal-item relative flex flex-col gap-6">
          {/* BEFORE CARD: The Patchwork */}
          <div className="relative p-8 rounded-[3rem] border-2 border-dashed border-[#FF6F61]/30 bg-white/50 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#004D40]/60 uppercase tracking-widest text-sm">
                Before
              </h3>
              <span className="text-xs font-mono bg-[#FF6F61]/10 text-[#FF6F61] px-3 py-1 rounded-full">
                Disconnected
              </span>
            </div>

            {/* Chaotic layout of floating disconnected tools */}
            <div className="grid grid-cols-2 gap-3 opacity-60 grayscale group-hover:grayscale-0 transition-all duration-500">
              <div className="bg-white p-3 rounded-2xl border border-[#004D40]/10 shadow-sm flex items-center gap-2 text-sm text-[#004D40]">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  ⭐
                </div>{" "}
                Reviews App
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#004D40]/10 shadow-sm flex items-center gap-2 text-sm text-[#004D40] translate-y-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  💬
                </div>{" "}
                SMS Tool
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#004D40]/10 shadow-sm flex items-center gap-2 text-sm text-[#004D40] -translate-y-1">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  📊
                </div>{" "}
                Spreadsheets
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#004D40]/10 shadow-sm flex items-center gap-2 text-sm text-[#004D40] translate-y-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  📝
                </div>{" "}
                Sticky Notes
              </div>
            </div>
          </div>

          {/* Connection Arrow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-[#F9F5E7] rounded-full flex items-center justify-center border-4 border-white shadow-md">
            <ArrowDown className="text-[#00A5D4]" />
          </div>

          {/* AFTER CARD: The SurfBloom Ecosystem */}
          <div className="relative p-8 rounded-[3rem] bg-gradient-to-br from-[#00A5D4]/10 to-[#00A5D4]/5 border border-[#00A5D4]/20 shadow-[0_20px_40px_rgba(0,165,212,0.1)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#00A5D4] uppercase tracking-widest text-sm">
                After
              </h3>
              <span className="text-xs font-mono bg-white text-[#00A5D4] px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Sparkles size={12} /> Unified
              </span>
            </div>

            {/* Unified, blooming ecosystem visual */}
            <div className="bg-white rounded-3xl p-5 border border-[#00A5D4]/10 shadow-sm">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px bg-gradient-to-r from-transparent to-[#00A5D4]/30 flex-grow"></div>
                <Workflow className="text-[#00A5D4]" size={24} />
                <div className="h-px bg-gradient-to-l from-transparent to-[#00A5D4]/30 flex-grow"></div>
              </div>
              <p className="text-center font-semibold text-[#004D40] text-sm mb-4">
                One seamless{" "}
                <span className="sb-font-great-vibes italic text-[#FF6F61] text-lg">
                  flow
                </span>
              </p>
              <div className="flex justify-center flex-wrap gap-2">
                <span className="text-xs font-bold text-[#004D40]/70 bg-[#F9F5E7] px-3 py-1.5 rounded-lg border border-[#004D40]/5">
                  Reviews
                </span>
                <span className="text-xs font-bold text-[#004D40]/70 bg-[#F9F5E7] px-3 py-1.5 rounded-lg border border-[#004D40]/5">
                  Conversations
                </span>
                <span className="text-xs font-bold text-[#004D40]/70 bg-[#F9F5E7] px-3 py-1.5 rounded-lg border border-[#004D40]/5">
                  Campaigns
                </span>
                <span className="text-xs font-bold text-[#004D40]/70 bg-[#F9F5E7] px-3 py-1.5 rounded-lg border border-[#004D40]/5">
                  Team Tasks
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMMERSIVE BREAK SECTION: Perfect Visibility (The Lagoon Theme) */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#00A5D4] to-[#007A9E] px-12 pt-40 pb-52 md:pb-56 mt-12 md:mt-16 mb-14 md:mb-20 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(0,165,212,0.25)]">
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
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#F9F5E7]/20 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4 pointer-events-none" />

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

      <section
        id="protocol"
        className="relative bg-[#F9F5E7] pt-8 md:pt-10 pb-24"
      >
        {[
          {
            title: "Review Lifecycle",
            icon: <Waves className="text-[#00A5D4]" size={64} />,
            desc: "Automate 5-star review flows like perfect waves.",
          },
          {
            title: "AI Receptionist",
            icon: <Activity className="text-[#FF6F61]" size={64} />,
            desc: "Telemetric booking with an EKG pulse on your calendar.",
          },
          {
            title: "Multi-LLM Swap",
            icon: <Flower2 className="text-[#004D40]" size={64} />,
            desc: "Frictionless AI routing for maximum organic growth.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="protocol-panel sticky top-0 flex h-screen w-full items-center justify-center p-8"
          >
            <div className="flex h-[70vh] w-full max-w-5xl flex-col items-center justify-center gap-8 rounded-[4rem] border border-[#00A5D4]/20 bg-white p-16 text-center shadow-xl">
              {item.icon}
              <h2 className="sb-font-playfair text-6xl font-bold">
                {item.title}
              </h2>
              <p className="max-w-lg text-xl opacity-80">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* IMMERSIVE BREAK: THE 3 PILLARS - Perfect Harmony style (coral/sunset) */}
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
        <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-[#F9F5E7]/20 rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#004D40] font-bold mb-16 drop-shadow-sm flex flex-col md:flex-row items-center justify-center">
            Find your
            <span className="sb-font-great-vibes italic text-[#F9F5E7] font-normal text-6xl md:text-9xl px-4 tracking-wide drop-shadow-sm block md:inline-block mt-2 md:mt-0">
              flow.
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Card 1: Workflows */}
            <Link
              href="/product/workflows"
              className="reveal-item group bg-white/5 backdrop-blur-md border border-[#F9F5E7]/20 p-8 rounded-[2rem] hover:bg-white/10 hover:border-[#F9F5E7]/30 transition-all duration-500 flex flex-col shadow-xl hover:-translate-y-2"
            >
              <div className="w-14 h-14 rounded-full bg-[#F9F5E7]/10 border border-[#F9F5E7]/20 text-[#004D40] flex items-center justify-center mb-6 shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 16V9a2 2 0 0 0-2-2h-3" />
                  <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
                  <path d="m14 11-3-3 3-3" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#004D40] mb-3">
                Workflows
              </h3>
              <p className="text-[#004D40]/80 font-medium leading-relaxed mb-8 flex-grow">
                Automate the repetitive work so you can focus on building the
                relationships.
              </p>
              <span className="text-[#F9F5E7] font-bold group-hover:translate-x-2 transition-transform flex items-center gap-2">
                Learn more <ArrowRight size={18} />
              </span>
            </Link>

            {/* Card 2: Tasks */}
            <Link
              href="/product/tasks"
              className="reveal-item group bg-white/5 backdrop-blur-md border border-[#F9F5E7]/20 p-8 rounded-[2rem] hover:bg-white/10 hover:border-[#F9F5E7]/30 transition-all duration-500 flex flex-col shadow-xl hover:-translate-y-2 delay-100"
            >
              <div className="w-14 h-14 rounded-full bg-[#F9F5E7]/10 border border-[#F9F5E7]/20 text-[#004D40] flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[#004D40] mb-3">Tasks</h3>
              <p className="text-[#004D40]/80 font-medium leading-relaxed mb-8 flex-grow">
                Turn messages and triggers into clear action items your entire
                team can see.
              </p>
              <span className="text-[#F9F5E7] font-bold group-hover:translate-x-2 transition-transform flex items-center gap-2">
                Learn more <ArrowRight size={18} />
              </span>
            </Link>

            {/* Card 3: Reviews */}
            <Link
              href="/product/reviews"
              className="reveal-item group bg-white/5 backdrop-blur-md border border-[#F9F5E7]/20 p-8 rounded-[2rem] hover:bg-white/10 hover:border-[#F9F5E7]/30 transition-all duration-500 flex flex-col shadow-xl hover:-translate-y-2 delay-200"
            >
              <div className="w-14 h-14 rounded-full bg-[#F9F5E7]/10 border border-[#F9F5E7]/20 text-[#004D40] flex items-center justify-center mb-6 shadow-inner">
                <Star size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[#004D40] mb-3">
                Reviews
              </h3>
              <p className="text-[#004D40]/80 font-medium leading-relaxed mb-8 flex-grow">
                Ask every single client at the perfect moment and dominate your
                local search.
              </p>
              <span className="text-[#F9F5E7] font-bold group-hover:translate-x-2 transition-transform flex items-center gap-2">
                Learn more <ArrowRight size={18} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <BookDemoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
