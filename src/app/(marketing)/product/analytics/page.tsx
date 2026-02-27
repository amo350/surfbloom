"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BarChart2,
  ArrowRight,
  TrendingUp,
  Mail,
  Smartphone,
  MousePointerClick,
  CheckCircle2,
  Star,
  Users,
  Calendar,
  Activity,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ReportingPage() {
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

      // Chart Bar Growth Animation
      gsap.fromTo(
        ".chart-bar",
        { height: "0%" },
        {
          height: (i, target) => target.getAttribute("data-h"),
          duration: 1.5,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".chart-container",
            start: "top 80%",
          },
        },
      );
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
        {/* Layer 1: Abstract Data/Clean Overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.05] mix-blend-multiply pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=2000')",
          }}
        />

        {/* Layer 2: Modern Grid Fade */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#004D401A_1px,transparent_1px),linear-gradient(to_bottom,#004D401A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto pt-40 md:pt-48 pb-20">
          <div className="hero-elem inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-[#00A5D4]/20 text-[#00A5D4] font-bold text-sm mb-10 shadow-sm">
            <BarChart2 size={18} />
            <span className="tracking-wide uppercase">
              Reporting & Dashboards
            </span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-8xl font-bold text-[#004D40] leading-[1.05] mb-8 tracking-tight drop-shadow-sm">
            Know what's working without{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              digging
            </span>{" "}
            for it.
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/75 leading-relaxed max-w-4xl mx-auto font-medium">
            Every workflow, campaign, and task generates data. SurfBloom turns
            it into dashboards you can actually read — so you make decisions
            based on numbers, not gut feelings.
          </p>
        </div>
      </section>

      {/* SECTION 1: Campaign & Workflow Performance */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative flex justify-center">
          {/* CSS Mockup: Campaign Performance Dashboard */}
          <div className="reveal-item float-ui w-full max-w-lg bg-white rounded-[2.5rem] border border-[#00A5D4]/20 shadow-[0_30px_60px_rgba(0,77,64,0.1)] p-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#00A5D4]/10">
              <div>
                <h3 className="font-bold text-[#004D40] text-lg flex items-center gap-2">
                  <Activity size={18} className="text-[#00A5D4]" /> Campaign
                  Performance
                </h3>
                <p className="text-[10px] text-[#004D40]/50 uppercase tracking-wider font-bold mt-1">
                  Last 30 Days
                </p>
              </div>
              <div className="bg-[#F9F5E7] p-2 rounded-lg border border-[#004D40]/5 text-[#004D40] flex items-center gap-1">
                <Calendar size={12} />{" "}
                <span className="text-xs font-bold">This Month</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Campaign Row 1: Email */}
              <div className="bg-white border border-[#00A5D4]/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#00A5D4]/10 flex items-center justify-center text-[#00A5D4]">
                      <Mail size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#004D40]">
                        Welcome Drip Sequence
                      </p>
                      <p className="text-[10px] text-[#004D40]/50">
                        Automated Workflow
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#00A5D4]/5">
                  <div>
                    <p className="text-[10px] text-[#004D40]/50 font-bold uppercase">
                      Sent
                    </p>
                    <p className="text-lg font-bold text-[#004D40]">1,248</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#00A5D4] font-bold uppercase flex items-center gap-1">
                      <MousePointerClick size={10} /> Open Rate
                    </p>
                    <p className="text-lg font-bold text-[#004D40]">68%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#10B981] font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 size={10} /> Clicked
                    </p>
                    <p className="text-lg font-bold text-[#004D40]">24%</p>
                  </div>
                </div>
              </div>

              {/* Campaign Row 2: SMS */}
              <div className="bg-white border border-[#FF6F61]/20 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF6F61]"></div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#FF6F61]/10 flex items-center justify-center text-[#FF6F61]">
                      <Smartphone size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#004D40]">
                        Flash Sale: Spring Promo
                      </p>
                      <p className="text-[10px] text-[#004D40]/50">
                        One-Time Blast
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#004D40]/40 bg-[#F9F5E7] border border-[#004D40]/10 px-2 py-0.5 rounded">
                    Completed
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#00A5D4]/5">
                  <div>
                    <p className="text-[10px] text-[#004D40]/50 font-bold uppercase">
                      Delivered
                    </p>
                    <p className="text-lg font-bold text-[#004D40]">99.2%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#00A5D4] font-bold uppercase flex items-center gap-1">
                      <MousePointerClick size={10} /> CTR
                    </p>
                    <p className="text-lg font-bold text-[#004D40]">18%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#FF6F61] font-bold uppercase flex items-center gap-1">
                      <TrendingUp size={10} /> Replied
                    </p>
                    <p className="text-lg font-bold text-[#004D40]">12%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            See which messages land and which{" "}
            <span className="sb-font-great-vibes italic text-[#00A5D4] pr-2">
              don't
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Every text sent, email delivered, and workflow executed gets
              tracked automatically. Open rates, response rates, delivery
              failures — all in one view.
            </p>
            <p>
              See which campaigns drive replies and which get ignored. See which
              workflows are firing daily and which haven't triggered in weeks.
              Filter by date range, campaign, or workflow to spot what's worth
              keeping and what needs reworking.
            </p>
            <p className="font-semibold text-[#004D40]">
              No exporting CSVs, no stitching together reports from three
              different tools.
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

      {/* IMMERSIVE BREAK SECTION: Total Clarity */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#00A5D4] to-[#007A9E] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(0,165,212,0.3)]">
        {/* Clear Perspective Background */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=2000"
            alt="Aerial view of crystal clear ocean water"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#F9F5E7]/20 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#F9F5E7] font-bold flex flex-col md:flex-row items-center justify-center drop-shadow-sm">
            Total
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal text-6xl md:text-9xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-md">
              Clarity.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7]/90 font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            Step back from the day-to-day noise. See exactly how your business
            is growing from a single, unified perspective.
          </p>
        </div>
      </section>

      {/* SECTION 2: The Full Picture */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6">
            Tasks closed. Reviews collected. Trends over{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              time.
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Campaigns are only one piece. SurfBloom rolls up your team's task
              completion rates, average response times, and overdue counts into
              the same dashboard.
            </p>
            <p>
              See how many reviews you've collected this month versus last.
              Track which team members are closing the most follow-ups and where
              things are stalling. Over time, the patterns tell the story — are
              you getting more reviews since launching that workflow? Did that
              drip campaign actually bring people back?
            </p>
            <p className="font-semibold text-[#004D40]">
              The answers are already in your data. SurfBloom just puts them
              where you can see them.
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

        {/* CSS Mockup: Multi-Metric Dashboard */}
        <div className="reveal-item relative flex justify-center py-8">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-[#00A5D4]/20 shadow-[0_30px_60px_rgba(0,77,64,0.15)] p-6 md:p-8 flex flex-col gap-6">
            {/* Metric 1: Review Trends (Bar Chart) */}
            <div className="bg-[#F9F5E7]/50 rounded-2xl border border-[#00A5D4]/10 p-5 shadow-inner">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-sm font-bold text-[#004D40] flex items-center gap-2">
                    <Star size={14} className="text-[#FFD54F] fill-[#FFD54F]" />{" "}
                    Reviews Collected
                  </h4>
                  <p className="text-[10px] text-[#004D40]/50 uppercase font-bold mt-1">
                    Last 6 Months
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#004D40]">142</p>
                  <p className="text-[10px] text-[#10B981] font-bold flex items-center justify-end gap-0.5">
                    <TrendingUp size={10} /> +24% YoY
                  </p>
                </div>
              </div>

              {/* CSS Bar Chart */}
              <div className="chart-container h-24 flex items-end justify-between gap-2 pt-4 border-t border-[#00A5D4]/10">
                {[
                  { month: "Jan", h: "30%" },
                  { month: "Feb", h: "45%" },
                  { month: "Mar", h: "60%" },
                  { month: "Apr", h: "80%" },
                  { month: "May", h: "75%" },
                  { month: "Jun", h: "100%", active: true },
                ].map((bar, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center flex-1 gap-2"
                  >
                    <div className="w-full h-full bg-[#004D40]/5 rounded-t-sm relative flex items-end">
                      <div
                        className={`chart-bar w-full rounded-t-sm ${bar.active ? "bg-[#FF6F61] shadow-[0_0_10px_rgba(255,111,97,0.4)]" : "bg-[#00A5D4]"}`}
                        data-h={bar.h}
                      ></div>
                    </div>
                    <span className="text-[8px] font-bold text-[#004D40]/50">
                      {bar.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metric 2: Team Task Leaderboard */}
            <div className="bg-white rounded-2xl border border-[#00A5D4]/10 p-5 shadow-sm">
              <h4 className="text-sm font-bold text-[#004D40] flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <Users size={14} className="text-[#00A5D4]" /> Tasks Closed
                (This Week)
              </h4>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00A5D4]/10 text-[#00A5D4] flex items-center justify-center text-xs font-bold">
                    SJ
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-[#004D40]">Sarah J.</span>
                      <span className="font-bold text-[#00A5D4]">42</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F9F5E7] rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-[#00A5D4] rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FF6F61]/10 text-[#FF6F61] flex items-center justify-center text-xs font-bold">
                    MR
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-[#004D40]">Mike R.</span>
                      <span className="font-bold text-[#FF6F61]">38</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F9F5E7] rounded-full overflow-hidden">
                      <div className="w-[75%] h-full bg-[#FF6F61] rounded-full"></div>
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
