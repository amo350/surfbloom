"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Smartphone,
  Star,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function AutomotivePage() {
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
        {/* Background Image with Cinematic Garage Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=2000&q=80"
            alt="Modern auto repair shop with mechanic and customer"
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
            <Wrench size={18} className="text-[#00A5D4]" />
            <span className="tracking-wide uppercase text-[#004D40]">
              Solutions for Automotive
            </span>
          </div>

          <h1 className="hero-elem sb-font-playfair text-6xl md:text-7xl lg:text-8xl font-bold text-[#004D40] leading-[1.1] mb-8 tracking-tight">
            Fill more bays by fixing your{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] font-normal pr-4">
              follow-up.
            </span>
          </h1>

          <p className="hero-elem text-xl md:text-2xl text-[#004D40]/80 leading-relaxed max-w-3xl mx-auto font-medium">
            Most shops lose repeat business because they never ask for it.
            SurfBloom automates service reminders, review requests, and lead
            follow-ups so customers come back before they even think about going
            somewhere else.
          </p>
        </div>
      </section>

      {/* SECTION 1: Campaigns */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80"
              alt="Customer scrolling phone in modern waiting room"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Maintenance Reminder Campaign Overlay */}
            <div className="absolute top-[10%] right-[10%] w-[85%] md:w-[75%] bg-white/95 backdrop-blur-md rounded-2xl border border-[#00A5D4]/20 shadow-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-3 bg-[#F9F5E7] p-3 rounded-xl border border-[#00A5D4]/10">
                <CheckCircle2 className="text-[#10B981]" size={16} />
                <div className="flex-grow">
                  <p className="text-xs font-bold text-[#004D40]">
                    Service Completed
                  </p>
                  <p className="text-[10px] text-[#004D40]/60">
                    Full Synthetic Oil Change
                  </p>
                </div>
              </div>
              <div className="flex justify-center -my-1 z-10">
                <div className="bg-[#004D40] text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Clock size={8} /> Wait 90 Days
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border-2 border-[#00A5D4]/30 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00A5D4]"></div>
                <Smartphone className="text-[#00A5D4]" size={16} />
                <div className="flex-grow pl-1">
                  <p className="text-xs font-bold text-[#004D40]">
                    Service Reminder SMS
                  </p>
                  <p className="text-[10px] text-[#004D40]/70 italic mt-0.5">
                    "Hi Mike, it's been 3 months since your last oil change..."
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#00A5D4] bg-[#00A5D4]/10 px-2 py-1 rounded-full whitespace-nowrap">
                  Active
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
              Send an oil change reminder at 90 days, automate a thank-you after
              every service, or re-engage customers you haven't seen in six
              months. Every send is tracked so you know what landed and what
              didn't.
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

      {/* IMMERSIVE BREAK SECTION: Smooth Cruising */}
      <section className="impact-section relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-[#00A5D4] to-[#007A9E] px-12 py-40 my-32 mx-6 md:mx-12 shadow-[0_30px_60px_rgba(0,165,212,0.25)]">
        {/* Coastal Highway Sunset */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80"
            alt="Driving on a coastal highway at sunset"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-[#F9F5E7]/20 rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <h2 className="impact-text sb-font-playfair text-5xl md:text-7xl text-[#004D40] font-bold flex flex-col md:flex-row items-center justify-center">
            Smooth
            <span className="sb-font-great-vibes italic text-[#F9F5E7] font-normal text-6xl md:text-9xl px-4 tracking-wide mt-4 md:mt-0 drop-shadow-sm">
              Cruising.
            </span>
          </h2>
          <p className="impact-text text-xl md:text-3xl text-[#F9F5E7] font-medium max-w-3xl leading-relaxed drop-shadow-sm">
            Keep your bays full, your team focused, and your customers coming
            back on absolute autopilot.
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
              using your shop name, tone, and services.
            </p>
            <p>
              Your customers think they're talking to your front desk. You see
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
              src="https://images.unsplash.com/photo-1587582423116-ec07293f0395?auto=format&fit=crop&w=1200&q=80"
              alt="Closed auto shop at dusk"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-[0.8]"
            />
            {/* Glowing AI Chat UI overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white/95 backdrop-blur-md rounded-3xl border border-[#00A5D4]/30 shadow-2xl overflow-hidden">
              <div className="bg-[#004D40] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative">
                  <MessageSquare className="text-white" size={20} />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#004D40]"></div>
                </div>
                <div>
                  <p className="font-bold text-white">Auto AI Assistant</p>
                  <p className="text-white/70 text-xs flex items-center gap-1">
                    <Clock size={10} /> 8:45 PM (After Hours)
                  </p>
                </div>
              </div>
              <div className="p-5 space-y-4 bg-[#F9F5E7]">
                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#004D40]/5 text-[#004D40]/80 text-sm max-w-[85%] shadow-sm">
                  Hey, do you guys have a night drop box? My car is getting
                  towed there now.
                </div>
                <div className="bg-[#00A5D4]/10 p-3 rounded-xl rounded-tr-none border border-[#00A5D4]/10 text-[#004D40] text-sm max-w-[85%] ml-auto shadow-sm">
                  Yes we do! The key drop box is located on the right side of
                  the main garage door. There are envelopes inside—just drop
                  your keys in the slot. Can I get a good number to call you at
                  in the morning? 🚙
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Review Collection */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80"
              alt="Driving away visible through rearview mirror"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            {/* Floating Notification UI overlay */}
            <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-[#00A5D4]/20 shadow-lg max-w-xs animate-pulse-slow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FF6F61]/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Star className="text-[#FF6F61] fill-[#FF6F61]" size={20} />
                </div>
                <div>
                  <p className="font-bold text-[#004D40] text-[15px]">
                    Elite Auto Repair
                  </p>
                  <p className="text-[#004D40]/70 text-xs leading-relaxed mt-1">
                    Hey Chris! Thanks for trusting us with your brakes today. If
                    you have 30 seconds, we'd love a Google review!
                  </p>
                  <p className="text-[#00A5D4] text-xs font-semibold mt-2">
                    review.link/elite-auto
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
              The shops with the most reviews win local search. When a customer
              opts into your messaging, a workflow handles the rest — a
              personalized text goes out after every service with a direct link
              to your Google review page.
            </p>
            <p>
              AI writes the message using the customer's name and service
              details so it reads like a personal follow-up, not a mass blast.
              Didn't leave a review after five days? A gentle nudge goes out
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

      {/* SECTION 4: Feedback */}
      <section className="scroll-section relative py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="reveal-item sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-6 leading-tight">
            Catch bad experiences before they go{" "}
            <span className="sb-font-great-vibes italic text-[#FF6F61] pr-2">
              public
            </span>
          </h2>
          <div className="reveal-item space-y-6 text-[#004D40]/75 text-lg leading-relaxed">
            <p>
              Not every unhappy customer leaves a review — most just find
              another shop. SurfBloom's feedback system gives them a private
              channel to tell you what went wrong before they tell Google.
            </p>
            <p>
              Negative feedback triggers a workflow — task created, team
              notified, follow-up sent — so you can recover the relationship
              while it's still recoverable. Turn a would-be 1-star review into a
              loyal customer.
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
        <div className="relative">
          {/* Hybrid Image + Floating UI Mockup */}
          <div className="reveal-item float-ui relative rounded-[3rem] overflow-hidden border border-[#00A5D4]/20 shadow-[0_25px_50px_rgba(0,77,64,0.1)] group">
            <Image
              src="https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=1200&q=80"
              alt="Thoughtful auto shop owner leaning against garage door"
              width={800}
              height={600}
              className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition-transform duration-700 filter contrast-125 saturate-50"
            />
            {/* Feedback Intercept Overlay */}
            <div className="absolute bottom-[15%] right-[10%] w-[75%] bg-white/95 backdrop-blur-md rounded-2xl border-l-4 border-[#FF6F61] shadow-2xl p-4">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-[#FF6F61]" />
                  <p className="text-xs font-bold text-[#004D40] uppercase tracking-wider">
                    Private Feedback Captured
                  </p>
                </div>
                <p className="text-[10px] text-[#004D40]/50 font-bold">
                  JUST NOW
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
                David R. (2018 F-150)
              </p>
              <p className="text-xs text-[#004D40]/70 italic border-l-2 border-gray-200 pl-2">
                "Truck runs fine but there's a grease smudge on the driver seat
                that wasn't there before."
              </p>
              <div className="mt-3 flex gap-2">
                <div className="text-[10px] font-bold text-white bg-[#004D40] px-2 py-1 rounded">
                  Task Created
                </div>
                <div className="text-[10px] font-bold text-[#004D40] bg-[#F9F5E7] px-2 py-1 rounded border border-[#004D40]/10">
                  Auto-Apology Sent
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
