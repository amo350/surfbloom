"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ShieldCheck } from "lucide-react";

export default function TermsPage() {
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
            <ShieldCheck size={16} /> Legal
          </div>
          <h1 className="sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] mb-4">
            Terms of Service
          </h1>
          <p className="text-[#004D40]/60 font-medium">
            Effective Date: February 26, 2026
          </p>
        </div>

        {/* Document Content */}
        <div className="fade-in bg-white rounded-3xl shadow-sm border border-[#00A5D4]/10 p-8 md:p-12 lg:p-16 text-[#004D40]/80 leading-relaxed text-sm md:text-base">
          <p className="mb-8">
            Welcome to SurfBloom. Please read these Terms of Service ("Terms")
            carefully before using the SurfBloom platform, website, APIs, or any
            related services (collectively, the "Service"). By accessing or
            using the Service, you agree to be bound by these Terms. If you do
            not agree, do not use the Service.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            1. Definitions
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li>
              <strong>"SurfBloom," "we," "us," or "our"</strong> refers to
              SurfBloom, Inc., the company that owns and operates the Service.
            </li>
            <li>
              <strong>"Customer," "you," or "your"</strong> refers to the
              individual or business entity that registers for and uses the
              Service.
            </li>
            <li>
              <strong>"End User"</strong> refers to your clients, patients,
              tenants, members, or other individuals who receive communications
              sent through the Service on your behalf.
            </li>
            <li>
              <strong>"Platform"</strong> refers to the SurfBloom web
              application, including all features such as workflows, campaigns,
              CRM, tasks, reviews, surveys, feedback, conversations, AI tools,
              and analytics.
            </li>
            <li>
              <strong>"Content"</strong> refers to any text, images, data,
              messages, or other materials you create, upload, send, or generate
              through the Service, including AI-generated content.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            2. Eligibility and Account Registration
          </h2>
          <p className="mb-8">
            You must be at least 18 years old and have the legal authority to
            enter into these Terms on behalf of yourself or the business entity
            you represent. By creating an account, you represent and warrant
            that all registration information you provide is accurate, current,
            and complete. You are responsible for maintaining the
            confidentiality of your account credentials and for all activities
            that occur under your account. You agree to notify us immediately of
            any unauthorized use of your account.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            3. The Service
          </h2>
          <p className="mb-4">
            SurfBloom provides a marketing automation platform for local
            businesses. The Service may include, but is not limited to, visual
            workflow automation, SMS and email messaging, AI-powered content
            generation, review collection and management, CRM and contact
            management, task management, surveys, feedback collection, campaign
            management, AI chatbot functionality, and analytics.
          </p>
          <p className="mb-8">
            We reserve the right to modify, suspend, or discontinue any part of
            the Service at any time, with or without notice. We will make
            reasonable efforts to notify you of material changes that affect
            your use of the Service.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            4. Acceptable Use
          </h2>
          <p className="mb-4">
            You agree to use the Service only for lawful purposes and in
            accordance with these Terms. You are solely responsible for all
            Content sent, created, or generated through your account, including
            messages sent to your End Users.
          </p>
          <p className="mb-2 font-semibold text-[#004D40]">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Use the Service to send unsolicited messages, spam, or messages to
              individuals who have not provided proper consent to receive
              communications from your business.
            </li>
            <li>
              Use the Service to send content that is illegal, threatening,
              abusive, harassing, defamatory, obscene, or otherwise
              objectionable.
            </li>
            <li>
              Use the Service to promote or sell cannabis, controlled
              substances, prescription medications, illegal goods or services,
              payday loans, cryptocurrency investment schemes, gambling, or
              weapons.
            </li>
            <li>
              Use the Service to impersonate any person or entity, or falsely
              state or misrepresent your affiliation with any person or entity.
            </li>
            <li>
              Use the Service to collect, store, or process sensitive personal
              information such as Social Security numbers, financial account
              numbers, or health records in a manner that violates applicable
              law.
            </li>
            <li>
              Attempt to gain unauthorized access to any part of the Service,
              other accounts, computer systems, or networks connected to the
              Service.
            </li>
            <li>
              Reverse engineer, decompile, or disassemble any part of the
              Service.
            </li>
            <li>
              Use the Service in any manner that could damage, disable,
              overburden, or impair the Service.
            </li>
            <li>
              Resell, sublicense, or redistribute access to the Service without
              our prior written consent.
            </li>
          </ul>
          <p className="mb-8 italic">
            Violation of this section may result in immediate suspension or
            termination of your account.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            5. SMS and Messaging Compliance
          </h2>
          <p className="mb-4">
            The Service enables you to send SMS, MMS, and email messages to your
            End Users. By using the messaging features of the Service, you agree
            to the following:
          </p>
          <ul className="space-y-4 mb-4">
            <li>
              <strong>Consent.</strong> You will only send messages to End Users
              who have provided express written consent to receive messages from
              your business. Consent must be obtained directly by you and cannot
              be purchased, rented, or transferred from a third party. You are
              solely responsible for maintaining records of consent, including
              the method, date, and time consent was obtained.
            </li>
            <li>
              <strong>Opt-Out.</strong> You will honor all opt-out requests
              immediately. Every SMS message sent through the Service must
              support standard opt-out keywords including STOP, CANCEL, END,
              QUIT, and UNSUBSCRIBE. You will not send messages to any End User
              who has opted out.
            </li>
            <li>
              <strong>Message Content.</strong> You are solely responsible for
              the content of every message sent through your account, including
              messages generated by AI. All messages must comply with the
              Telephone Consumer Protection Act (TCPA), CAN-SPAM Act, and all
              applicable federal, state, and local laws governing electronic
              communications.
            </li>
            <li>
              <strong>A2P 10DLC Registration.</strong> If you are sending SMS
              messages within the United States, you acknowledge that your
              business must be registered as a Brand with The Campaign Registry
              (TCR) and that your messaging use cases must be registered as
              Campaigns. SurfBloom will facilitate this registration process,
              but you are responsible for providing accurate business
              information and ensuring your messaging practices comply with
              carrier requirements.
            </li>
            <li>
              <strong>Prohibited Messaging Content.</strong> You will not use
              the Service to send messages promoting cannabis, controlled
              substances, firearms, hate speech, fraudulent financial products,
              or any content prohibited by carrier policies or applicable law.
            </li>
            <li>
              <strong>Frequency.</strong> You will not send messages at a
              frequency that exceeds what was disclosed to the End User at the
              time of consent.
            </li>
          </ul>
          <p className="mb-8">
            SurfBloom reserves the right to monitor messaging activity for
            compliance purposes and to suspend or terminate accounts that
            violate messaging regulations or carrier policies.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            6. AI-Generated Content
          </h2>
          <p className="mb-4">
            The Service includes AI-powered features that can generate text
            content on your behalf, including review requests, follow-up
            messages, chatbot responses, and other communications. You
            acknowledge and agree to the following:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li>
              You are solely responsible for reviewing, approving, and
              monitoring all AI-generated content sent to your End Users.
              AI-generated content is provided as a tool to assist your
              communications, not as a substitute for your judgment.
            </li>
            <li>
              SurfBloom does not guarantee the accuracy, appropriateness, or
              legal compliance of any AI-generated content. You are responsible
              for ensuring that all content sent through your account, whether
              written by you or generated by AI, complies with applicable laws,
              regulations, and these Terms.
            </li>
            <li>
              AI features may use third-party AI providers including Anthropic
              (Claude), OpenAI (GPT), Google (Gemini), and xAI (Grok). Your use
              of AI features is subject to the terms and policies of these
              providers. SurfBloom does not send your personal information to
              these providers beyond what is necessary to generate the requested
              content.
            </li>
            <li>
              SurfBloom is not liable for any claims, damages, or losses arising
              from AI-generated content sent through your account.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            7. Data Ownership and Privacy
          </h2>
          <ul className="space-y-4 mb-8">
            <li>
              <strong>Your Data.</strong> You retain all ownership rights to the
              data you upload, create, or collect through the Service, including
              contact lists, messages, survey responses, and business
              information. SurfBloom does not sell, rent, or share your data
              with third parties for their marketing purposes.
            </li>
            <li>
              <strong>Our Use of Your Data.</strong> We may use your data to
              provide and improve the Service, to generate aggregated and
              anonymized analytics, and to ensure compliance with these Terms
              and applicable law. Our collection and use of personal information
              is described in our Privacy Policy, which is incorporated into
              these Terms by reference.
            </li>
            <li>
              <strong>End User Data.</strong> You are responsible for your
              collection, use, and handling of End User data in compliance with
              all applicable privacy laws, including but not limited to
              applicable state privacy laws. You represent that you have
              provided appropriate notice to your End Users regarding how their
              data is collected and used through the Service.
            </li>
            <li>
              <strong>Data Portability.</strong> You may request an export of
              your data at any time by contacting us. We will provide your data
              in a standard, machine-readable format within a reasonable time
              frame.
            </li>
            <li>
              <strong>Data Deletion.</strong> Upon termination of your account,
              we will retain your data for 30 days to allow for recovery. After
              30 days, your data will be permanently deleted from our systems,
              except where retention is required by law.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            8. Payment Terms
          </h2>
          <p className="mb-4">
            Fees for the Service are based on a custom pricing plan determined
            between you and SurfBloom. By subscribing to a paid plan, you agree
            to pay all applicable fees as described in your order form or
            pricing agreement.
          </p>
          <p className="mb-4">
            All fees are billed in advance on a monthly or annual basis unless
            otherwise specified. Fees are non-refundable except where required
            by law.
          </p>
          <p className="mb-8">
            Failure to pay outstanding fees may result in suspension or
            termination of your account.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            9. Intellectual Property
          </h2>
          <ul className="space-y-4 mb-8">
            <li>
              <strong>Our Property.</strong> The Service, including all
              software, design, features, documentation, and trademarks, is the
              property of SurfBloom, Inc. and is protected by applicable
              intellectual property laws. These Terms do not grant you any
              right, title, or interest in the Service beyond the limited right
              to use it in accordance with these Terms.
            </li>
            <li>
              <strong>Your Property.</strong> You retain ownership of all
              Content you create or upload to the Service. By using the Service,
              you grant SurfBloom a limited, non-exclusive license to use,
              store, and process your Content solely to provide the Service to
              you.
            </li>
            <li>
              <strong>Feedback.</strong> If you provide suggestions, ideas, or
              feedback about the Service, you grant SurfBloom an unrestricted,
              irrevocable, royalty-free license to use and incorporate that
              feedback into the Service without obligation to you.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            10. Third-Party Services
          </h2>
          <p className="mb-8">
            The Service integrates with third-party services including but not
            limited to Twilio (messaging), Google (reviews and business
            profiles), and various AI providers. Your use of these integrations
            may be subject to the terms and policies of those third parties.
            SurfBloom is not responsible for the availability, accuracy, or
            practices of third-party services.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            11. Uptime and Availability
          </h2>
          <p className="mb-4">
            We strive to maintain high availability of the Service but do not
            guarantee uninterrupted or error-free operation. The Service may be
            temporarily unavailable due to maintenance, updates, or
            circumstances beyond our control. We will make reasonable efforts to
            notify you of scheduled maintenance in advance.
          </p>
          <p className="mb-8">
            SurfBloom is not liable for any losses or damages resulting from
            downtime, service interruptions, or data loss.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            12. Suspension and Termination
          </h2>
          <ul className="space-y-4 mb-4">
            <li>
              <strong>By You.</strong> You may cancel your account at any time
              by contacting us or through the account settings in the Platform.
              Cancellation takes effect at the end of your current billing
              cycle.
            </li>
            <li>
              <strong>By Us.</strong> We may suspend or terminate your account
              immediately, without prior notice, if we reasonably believe you
              have violated these Terms, including the Acceptable Use or SMS
              Compliance provisions. We may also suspend your account for
              non-payment of fees.
            </li>
          </ul>
          <p className="mb-8">
            Upon termination, your right to use the Service ceases immediately.
            Sections of these Terms that by their nature should survive
            termination will survive, including but not limited to Sections 7,
            9, 13, 14, and 15.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            13. Limitation of Liability
          </h2>
          <p className="mb-4 uppercase text-xs tracking-wide leading-relaxed font-semibold">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, SURFBLOOM, ITS OFFICERS,
            DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
            INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, REVENUE, DATA, OR
            BUSINESS OPPORTUNITIES, ARISING OUT OF OR RELATED TO YOUR USE OF THE
            SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER
            LEGAL THEORY.
          </p>
          <p className="mb-8 uppercase text-xs tracking-wide leading-relaxed font-semibold">
            OUR TOTAL AGGREGATE LIABILITY FOR ANY CLAIMS ARISING OUT OF OR
            RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT
            YOU PAID TO SURFBLOOM IN THE TWELVE (12) MONTHS IMMEDIATELY
            PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            14. Indemnification
          </h2>
          <p className="mb-8">
            You agree to indemnify, defend, and hold harmless SurfBloom, its
            officers, directors, employees, and agents from and against any
            claims, damages, losses, liabilities, and expenses (including
            reasonable attorneys' fees) arising out of or related to: (a) your
            use of the Service; (b) your Content, including AI-generated content
            sent through your account; (c) your violation of these Terms; (d)
            your violation of any applicable law or regulation, including
            messaging and privacy laws; or (e) your violation of any third-party
            rights.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            15. Disclaimer of Warranties
          </h2>
          <p className="mb-4 uppercase text-xs tracking-wide leading-relaxed font-semibold">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
            WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT
            LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE, AND NON-INFRINGEMENT. SURFBLOOM DOES NOT WARRANT
            THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR
            THAT ANY DEFECTS WILL BE CORRECTED.
          </p>
          <p className="mb-8 uppercase text-xs tracking-wide leading-relaxed font-semibold">
            SURFBLOOM DOES NOT WARRANT THE ACCURACY OR RELIABILITY OF ANY
            AI-GENERATED CONTENT PRODUCED THROUGH THE SERVICE. YOU ACKNOWLEDGE
            THAT AI-GENERATED CONTENT MAY CONTAIN ERRORS OR INACCURACIES AND
            THAT YOU ARE SOLELY RESPONSIBLE FOR REVIEWING ALL CONTENT BEFORE IT
            IS SENT TO END USERS.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            16. Dispute Resolution
          </h2>
          <p className="mb-4">
            Any dispute arising out of or related to these Terms or the Service
            shall be resolved through binding arbitration administered by the
            American Arbitration Association in accordance with its Commercial
            Arbitration Rules. The arbitration shall be conducted in the state
            in which SurfBloom is incorporated. Judgment on the arbitration
            award may be entered in any court of competent jurisdiction.
          </p>
          <p className="mb-8">
            You agree that any dispute resolution proceedings will be conducted
            on an individual basis and not as part of a class, consolidated, or
            representative action.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            17. Governing Law
          </h2>
          <p className="mb-8">
            These Terms shall be governed by and construed in accordance with
            the laws of the state in which SurfBloom, Inc. is incorporated,
            without regard to its conflict of law provisions.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            18. Changes to These Terms
          </h2>
          <p className="mb-8">
            We may update these Terms from time to time. If we make material
            changes, we will notify you by email or through the Platform at
            least 30 days before the changes take effect. Your continued use of
            the Service after the effective date of the revised Terms
            constitutes your acceptance of the changes. If you do not agree to
            the revised Terms, you must stop using the Service.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            19. Contact
          </h2>
          <p className="mb-2">
            If you have questions about these Terms, please contact us at:
          </p>
          <div className="bg-[#F9F5E7] p-4 rounded-xl border border-[#00A5D4]/10 mb-8 inline-block">
            <p className="font-bold text-[#004D40]">SurfBloom, Inc.</p>
            <p>
              Email:{" "}
              <a
                href="mailto:legal@surfbloom.com"
                className="text-[#00A5D4] hover:underline"
              >
                info@surfbloom.com
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

          <div className="pt-8 border-t border-gray-100 text-sm font-semibold text-[#004D40]/50 text-center md:text-left">
            &copy; 2026 SurfBloom, Inc. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
