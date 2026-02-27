"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MessageSquare } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function SMSTermsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".fade-in", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#F9F5E7] selection:bg-[#FF6F61] selection:text-white pt-32 md:pt-40 pb-24 font-montserrat"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="fade-in mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#00A5D4]/20 text-[#00A5D4] font-bold text-xs mb-6 shadow-sm uppercase tracking-wider">
            <MessageSquare size={16} /> Legal
          </div>
          <h1 className="sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-4">
            SMS Terms & Conditions
          </h1>
          <p className="text-[#004D40]/60 font-medium">
            Effective Date: February 26, 2026
          </p>
        </div>

        {/* Document Content */}
        <div className="fade-in bg-white rounded-3xl shadow-sm border border-[#00A5D4]/10 p-8 md:p-12 lg:p-16 text-[#004D40]/80 leading-relaxed text-sm md:text-base">
          {/* Program Meta Box */}
          <div className="bg-[#F9F5E7]/50 border border-[#00A5D4]/10 p-5 rounded-xl mb-10 flex flex-col md:flex-row gap-6 md:gap-12">
            <div>
              <p className="text-[10px] font-bold text-[#00A5D4] uppercase tracking-wider mb-1">
                Program Name
              </p>
              <p className="font-bold text-[#004D40]">SurfBloom Messaging</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#00A5D4] uppercase tracking-wider mb-1">
                Program Provider
              </p>
              <p className="font-bold text-[#004D40]">
                SurfBloom, Inc. ("we," "us," "our")
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            1. Program Description
          </h2>
          <p className="mb-8">
            SurfBloom is a marketing automation platform used by local
            businesses to communicate with their clients via SMS and MMS text
            messages. By opting in, you agree to receive SMS messages from
            either SurfBloom directly or from a business that uses the SurfBloom
            platform. Messages may include appointment confirmations,
            follow-ups, review requests, surveys, promotional offers, account
            notifications, and chatbot responses. Messages sent by a business
            using SurfBloom are identified by that business's name in each
            message.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            2. Opt-In / Consent
          </h2>
          <p className="mb-8">
            You may opt in by submitting a web form at surfbloom.com or a
            SurfBloom customer's website with the SMS consent checkbox selected,
            providing your phone number in person or on a paper form that
            includes SMS consent language, scanning a QR code that directs to an
            opt-in form, or texting a keyword such as START or JOIN to a
            business's SurfBloom number. Consent is not a condition of any
            purchase, service, or appointment. Consent applies only to the
            specific business and messaging program you opted in to. Consent is
            not transferable or assignable. Your mobile opt-in data and consent
            will not be shared with or sold to third parties or affiliates for
            marketing or promotional purposes at any time.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            3. Message Frequency
          </h2>
          <p className="mb-8">
            Message frequency varies based on your relationship with the
            business and your interactions. You may receive recurring messages.
            Typical frequency ranges from 1 to 10 messages per month.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            4. Cost / Fees
          </h2>
          <p className="mb-8">Message and data rates may apply.</p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            5. Opt-Out (STOP)
          </h2>
          <p className="mb-8">
            You can opt out at any time by replying STOP to any message. After
            you opt out, you will receive one confirmation message that includes
            the business name and confirmation that no further messages will be
            sent. No additional messages will be sent unless you opt in again.
            Opt-out keywords supported: STOP, END, CANCEL, UNSUBSCRIBE, QUIT.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            6. Help (HELP)
          </h2>
          <p className="mb-8">
            For help, reply HELP to any message. You will receive a response
            that includes the business name and a contact phone number or email
            address. You may also contact SurfBloom directly at{" "}
            <a
              href="mailto:support@surfbloom.com"
              className="text-[#00A5D4] hover:underline"
            >
              support@surfbloom.com
            </a>
            .
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            7. Privacy & Data Use
          </h2>
          <p className="mb-8">
            Our Privacy Policy explains how we collect, use, and protect
            personal information:{" "}
            <Link href="/privacy" className="text-[#00A5D4] hover:underline">
              surfbloom.com/legal/privacy-policy
            </Link>
            . We use your phone number to deliver messages you opted in to
            receive. No mobile information will be shared with third parties or
            affiliates for marketing or promotional purposes. Your phone number
            will not be sold, rented, or shared with third parties for their
            marketing purposes. Message delivery is subject to carrier
            availability and may be delayed or fail.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            8. Carriers and Compatibility
          </h2>
          <p className="mb-8">
            Messages are sent via SMS and MMS to mobile numbers on supported
            U.S. carriers. Carriers are not liable for delayed or undelivered
            messages. Supported carriers include but are not limited to AT&T,
            T-Mobile, Verizon, and US Cellular. Carrier participation may change
            without notice.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            9. Eligibility
          </h2>
          <p className="mb-8">
            You must be 18 years of age or older and authorized to enroll the
            provided phone number.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            10. Changes and Contact
          </h2>
          <p className="mb-4">
            We may update these SMS Terms from time to time. Updates will be
            posted on this page with a new effective date.
          </p>

          <div className="bg-[#F9F5E7] p-4 rounded-xl border border-[#00A5D4]/10 mb-8 inline-block mt-2">
            <p className="font-bold text-[#004D40]">SurfBloom, Inc.</p>
            <p>
              Email:{" "}
              <a
                href="mailto:support@surfbloom.com"
                className="text-[#00A5D4] hover:underline"
              >
                support@surfbloom.com
              </a>
            </p>
            <p>
              Website:{" "}
              <a
                href="https://surfbloom.com"
                className="text-[#00A5D4] hover:underline"
              >
                surfbloom.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
