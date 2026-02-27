"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-[#004D40]/60 font-medium">
            Effective Date: February 26, 2026
          </p>
        </div>

        {/* Document Content */}
        <div className="fade-in bg-white rounded-3xl shadow-sm border border-[#00A5D4]/10 p-8 md:p-12 lg:p-16 text-[#004D40]/80 leading-relaxed text-sm md:text-base">
          <p className="mb-4">
            SurfBloom, Inc. ("SurfBloom," "we," "us," or "our") respects your
            privacy and is committed to protecting your personal information.
            This Privacy Policy explains how we collect, use, disclose, and
            protect information when you use the SurfBloom platform, website,
            APIs, or any related services (collectively, the "Service").
          </p>
          <p className="mb-8">
            By using the Service, you agree to the collection and use of
            information in accordance with this Privacy Policy. If you do not
            agree, do not use the Service.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            1. Who This Policy Applies To
          </h2>
          <p className="mb-4">This Privacy Policy applies to two groups:</p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li>
              <strong>Customers</strong> — individuals or businesses that
              register for and use the SurfBloom platform to manage their
              marketing, communications, and operations.
            </li>
            <li>
              <strong>End Users</strong> — individuals who receive
              communications (such as SMS messages, emails, surveys, or review
              requests) sent by our Customers through the SurfBloom platform. If
              you are an End User, the business that sent you a message is the
              controller of your data. Please contact that business directly for
              questions about how your information is used. This Privacy Policy
              describes how SurfBloom processes that data on the Customer's
              behalf.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            2. Information We Collect
          </h2>

          <h3 className="text-lg font-semibold text-[#004D40] mb-2 mt-6">
            Information You Provide Directly
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              Account registration information, including your name, email
              address, phone number, business name, business address, and
              Employer Identification Number (EIN) for messaging compliance
              registration.
            </li>
            <li>
              Payment and billing information processed through our third-party
              payment provider. SurfBloom does not store full credit card
              numbers on our servers.
            </li>
            <li>
              Contact lists and End User data you upload or collect through the
              Service, including names, phone numbers, email addresses, tags,
              notes, and any custom fields you create.
            </li>
            <li>
              Content you create through the Service, including messages,
              workflows, campaigns, survey questions, task descriptions, and
              AI-generated content.
            </li>
            <li>
              Communications you send to us, such as support requests, feedback,
              and emails.
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-[#004D40] mb-2">
            Information Collected Automatically
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              Usage data, including pages visited, features used, workflows
              created, messages sent, and actions taken within the Platform.
            </li>
            <li>
              Device and browser information, including IP address, browser
              type, operating system, and device identifiers.
            </li>
            <li>
              Cookies and similar tracking technologies as described in Section
              8 of this Privacy Policy.
            </li>
            <li>
              Log data, including access times, error logs, and referring URLs.
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-[#004D40] mb-2">
            Information from Third Parties
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li>
              Information received from third-party services you connect to
              SurfBloom, such as Google Business Profile data, review data from
              public platforms, and data from integrated messaging providers.
            </li>
            <li>
              Information from our messaging infrastructure provider (Twilio)
              related to message delivery status, carrier responses, and
              compliance data.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            3. How We Use Your Information
          </h2>
          <p className="mb-4">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li>
              To provide, operate, and maintain the Service, including sending
              messages, executing workflows, managing contacts, and processing
              campaigns on your behalf.
            </li>
            <li>
              To create and manage your account, process payments, and provide
              customer support.
            </li>
            <li>
              To facilitate A2P 10DLC registration and messaging compliance with
              carriers and The Campaign Registry (TCR).
            </li>
            <li>
              To process your Content through third-party AI providers
              (Anthropic, OpenAI, Google, xAI) when you use AI-powered features.
              Only the minimum information necessary to generate the requested
              content is sent to these providers.
            </li>
            <li>
              To monitor messaging activity for compliance with applicable laws,
              carrier policies, and our Terms of Service.
            </li>
            <li>
              To improve and develop the Service, including analyzing usage
              patterns, troubleshooting issues, and developing new features.
            </li>
            <li>
              To send you Service-related communications, including account
              notifications, billing reminders, security alerts, and product
              updates.
            </li>
            <li>
              To protect the safety, security, and integrity of the Service and
              our users.
            </li>
            <li>
              To comply with legal obligations, respond to lawful requests, and
              enforce our Terms of Service.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            4. How We Share Your Information
          </h2>
          <p className="mb-4">
            We do not sell, rent, or trade your personal information or your End
            Users' personal information to third parties for their marketing
            purposes.
          </p>
          <p className="mb-4">
            We may share your information in the following circumstances:
          </p>
          <ul className="space-y-4 mb-8">
            <li>
              <strong>Service Providers.</strong> We share information with
              third-party service providers who perform services on our behalf,
              including Twilio (messaging delivery), cloud hosting providers,
              payment processors, and AI providers. These providers are
              contractually obligated to use your information only to provide
              services to us and in accordance with this Privacy Policy.
            </li>
            <li>
              <strong>AI Providers.</strong> When you use AI-powered features,
              the content of your prompts and relevant business context is sent
              to the AI provider you select (Anthropic, OpenAI, Google, or xAI)
              to generate the requested content. We do not send your full
              contact database or account information to AI providers.
            </li>
            <li>
              <strong>Compliance and Legal Requirements.</strong> We may
              disclose your information if required by law, subpoena, court
              order, or government request, or if we believe in good faith that
              disclosure is necessary to protect our rights, your safety, or the
              safety of others, to investigate fraud, or to respond to a
              government request.
            </li>
            <li>
              <strong>Business Transfers.</strong> If SurfBloom is involved in a
              merger, acquisition, or sale of assets, your information may be
              transferred as part of that transaction. We will notify you of any
              such change by email or prominent notice on the Platform.
            </li>
            <li>
              <strong>With Your Consent.</strong> We may share your information
              with third parties when you have given us explicit consent to do
              so.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            5. End User Data and Your Responsibilities
          </h2>
          <p className="mb-4">
            When you use SurfBloom to collect and manage End User data, you act
            as the data controller and SurfBloom acts as a data processor. You
            are responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Providing appropriate notice to your End Users about how their
              data is collected and used.
            </li>
            <li>
              Obtaining all required consents from End Users before collecting
              their data or sending them communications through the Service.
            </li>
            <li>
              Complying with all applicable privacy laws, including applicable
              state privacy laws, with respect to the End User data you collect
              and process through the Service.
            </li>
            <li>
              Responding to End User requests regarding their personal data,
              including requests for access, correction, or deletion.
            </li>
          </ul>
          <p className="mb-8">
            SurfBloom will assist you in responding to End User data requests to
            the extent the request relates to data processed through the
            Service.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            6. SMS and Messaging Data
          </h2>
          <p className="mb-4">
            When you send SMS or email messages through the Service, we collect
            and retain the following data for compliance and operational
            purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Message content, including the text of sent and received messages.
            </li>
            <li>Delivery status and carrier responses.</li>
            <li>
              Opt-in and opt-out records, including the method and timestamp of
              consent.
            </li>
            <li>
              Message logs, including sender, recipient, timestamp, and
              associated workflow or campaign.
            </li>
          </ul>
          <p className="mb-8">
            This data is retained for as long as your account is active and for
            a reasonable period after termination to comply with legal and
            regulatory requirements. Mobile information collected through the
            Service is never shared with or sold to third parties for their
            marketing or promotional purposes.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            7. Data Security
          </h2>
          <p className="mb-4">
            We implement commercially reasonable administrative, technical, and
            physical safeguards to protect your information from unauthorized
            access, use, alteration, and disclosure. These measures include
            encryption of data in transit and at rest, access controls, secure
            cloud infrastructure, and regular security assessments.
          </p>
          <p className="mb-8">
            However, no method of transmission over the internet or method of
            electronic storage is completely secure. We cannot guarantee the
            absolute security of your information. You are responsible for
            maintaining the security of your account credentials and for any
            activity that occurs under your account.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            8. Cookies and Tracking Technologies
          </h2>
          <p className="mb-4">
            We use cookies and similar technologies to operate and improve the
            Service. These include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>Essential Cookies</strong> — required for the Service to
              function, including authentication, session management, and
              security.
            </li>
            <li>
              <strong>Analytics Cookies</strong> — used to understand how the
              Service is used so we can improve it. These may include
              third-party analytics services.
            </li>
          </ul>
          <p className="mb-4">
            You can control cookie settings through your browser. Disabling
            essential cookies may prevent you from using certain features of the
            Service.
          </p>
          <p className="mb-8">
            We do not respond to Do Not Track signals at this time.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            9. Data Retention
          </h2>
          <p className="mb-4">
            We retain your account data and Content for as long as your account
            is active and as needed to provide the Service.
          </p>
          <p className="mb-4">
            Upon termination of your account, we retain your data for 30 days to
            allow for account recovery. After 30 days, your data is permanently
            deleted from our systems, except where retention is required by law
            or for legitimate business purposes such as resolving disputes,
            enforcing our Terms, or complying with legal obligations.
          </p>
          <p className="mb-8">
            Messaging logs and compliance records may be retained for a longer
            period as required by applicable telecommunications regulations.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            10. Your Rights and Choices
          </h2>
          <p className="mb-4">
            Depending on your location, you may have the following rights
            regarding your personal information:
          </p>
          <ul className="space-y-4 mb-4">
            <li>
              <strong>Access.</strong> You may request a copy of the personal
              information we hold about you.
            </li>
            <li>
              <strong>Correction.</strong> You may request that we correct
              inaccurate or incomplete personal information.
            </li>
            <li>
              <strong>Deletion.</strong> You may request that we delete your
              personal information, subject to certain exceptions required by
              law.
            </li>
            <li>
              <strong>Data Portability.</strong> You may request an export of
              your data in a standard, machine-readable format.
            </li>
            <li>
              <strong>Opt-Out of Communications.</strong> You may opt out of
              marketing communications from SurfBloom at any time by following
              the unsubscribe instructions in our emails or by contacting us
              directly. This does not apply to Service-related communications
              necessary for the operation of your account.
            </li>
          </ul>
          <p className="mb-8">
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:privacy@surfbloom.com"
              className="text-[#00A5D4] hover:underline"
            >
              privacy@surfbloom.com
            </a>
            . We will respond to your request within 30 days.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            11. Children's Privacy
          </h2>
          <p className="mb-8">
            The Service is not intended for use by individuals under the age of
            18. We do not knowingly collect personal information from children
            under 18. If we learn that we have collected personal information
            from a child under 18, we will take steps to delete that information
            promptly. If you believe a child has provided us with personal
            information, please contact us at{" "}
            <a
              href="mailto:privacy@surfbloom.com"
              className="text-[#00A5D4] hover:underline"
            >
              privacy@surfbloom.com
            </a>
            .
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            12. Third-Party Links and Services
          </h2>
          <p className="mb-8">
            The Service may contain links to third-party websites or integrate
            with third-party services. This Privacy Policy does not apply to
            those third-party services. We encourage you to review the privacy
            policies of any third-party services you access through or in
            connection with the Service.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            13. International Users
          </h2>
          <p className="mb-8">
            The Service is operated from the United States. If you access the
            Service from outside the United States, your information will be
            transferred to and processed in the United States. By using the
            Service, you consent to the transfer of your information to the
            United States.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            14. Changes to This Privacy Policy
          </h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. If we make
            material changes, we will notify you by email or through the
            Platform at least 30 days before the changes take effect. Your
            continued use of the Service after the effective date of the revised
            Privacy Policy constitutes your acceptance of the changes.
          </p>
          <p className="mb-8">
            The date at the top of this Privacy Policy indicates when it was
            last updated.
          </p>

          <h2 className="text-xl font-bold text-[#004D40] mt-10 mb-4">
            15. Contact Us
          </h2>
          <p className="mb-2">
            If you have questions about this Privacy Policy or our data
            practices, please contact us at:
          </p>
          <div className="bg-[#F9F5E7] p-4 rounded-xl border border-[#00A5D4]/10 mb-8 inline-block">
            <p className="font-bold text-[#004D40]">SurfBloom, Inc.</p>
            <p>
              Email:{" "}
              <a
                href="mailto:privacy@surfbloom.com"
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
