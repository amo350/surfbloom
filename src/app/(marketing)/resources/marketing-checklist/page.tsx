"use client";

import {
  Download,
  CheckSquare,
  Globe,
  MousePointerClick,
  Zap,
} from "lucide-react";

export default function MarketingChecklistPDF() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F9F5E7] py-12 px-4 print:bg-white print:py-0 print:px-0 font-montserrat flex justify-center">
      {/* Web-only Action Bar */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-[#FF6F61] hover:bg-[#D94E40] text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
        >
          <Download size={18} />
          Print / Save as PDF
        </button>
      </div>

      {/* The Printable Document */}
      <div className="bg-white w-full max-w-[850px] min-h-[1100px] shadow-2xl print:shadow-none p-12 md:p-16 relative">
        {/* Document Header */}
        <div className="border-b-4 border-[#00A5D4] pb-8 mb-8 flex flex-col items-start relative">
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#FF6F61] mb-2 bg-[#FF6F61]/10 px-3 py-1 rounded-full print:bg-transparent print:p-0 print:border print:border-[#FF6F61]">
            SurfBloom Playbooks
          </div>
          <h1 className="sb-font-playfair text-4xl md:text-5xl font-bold text-[#004D40] leading-tight max-w-2xl">
            The Local Business <br /> Marketing Checklist
          </h1>
          <p className="text-[#004D40]/60 font-medium mt-4 text-lg max-w-2xl">
            15 Things to Lock Down Before You Spend a Dollar on Ads.
          </p>
          <CheckSquare
            size={120}
            className="absolute right-0 top-4 text-[#F9F5E7] print:text-gray-100 -z-10"
          />
        </div>

        {/* Checklist Content */}
        <div className="space-y-10">
          {/* Section 1 */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#00A5D4]">
              <Globe size={20} />
              <h2 className="text-xl font-bold uppercase tracking-wider text-[#004D40]">
                1. Online Presence & Reputation
              </h2>
            </div>
            <div className="space-y-4 pl-2">
              <ChecklistItem text="Google Business Profile is officially claimed, verified, and fully filled out." />
              <ChecklistItem text="Business name, address, and phone number are exactly consistent across Google, Yelp, and Facebook." />
              <ChecklistItem text="You have at least 20 active Google reviews." />
              <ChecklistItem text="Someone is responding to every review — positive and negative — within 48 hours." />
              <ChecklistItem text="You have an automated system for requesting reviews after every job, visit, or appointment." />
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#FF6F61]">
              <MousePointerClick size={20} />
              <h2 className="text-xl font-bold uppercase tracking-wider text-[#004D40]">
                2. Website & Conversion
              </h2>
            </div>
            <div className="space-y-4 pl-2">
              <ChecklistItem text="Your website loads in under 3 seconds on a mobile connection." />
              <ChecklistItem text="Your phone number is highly visible and clickable to call on the mobile site." />
              <ChecklistItem text="You have a dedicated landing page built for each of your core services." />
              <ChecklistItem text="There is a clear way to capture leads from your site (form, webchat, or booking widget)." />
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#10B981]">
              <Zap size={20} />
              <h2 className="text-xl font-bold uppercase tracking-wider text-[#004D40]">
                3. Communication & Automation
              </h2>
            </div>
            <div className="space-y-4 pl-2">
              <ChecklistItem text="Every new lead gets an initial follow-up within 5 minutes of reaching out." />
              <ChecklistItem text="You have an automated follow-up sequence for leads that don't respond the first time." />
              <ChecklistItem text="A reactivation campaign exists for past clients you haven't heard from in 90+ days." />
              <ChecklistItem text="A Privacy Policy and SMS Terms of Service page are live on your website." />
              <ChecklistItem text="Opt-in consent is strictly tracked for every contact receiving text messages." />
              <ChecklistItem text="You have at least one automated workflow that runs your business without you touching it." />
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center print:absolute print:bottom-12 print:left-0 print:right-0 print:border-t-0">
          <p className="font-bold text-[#004D40]">Built by SurfBloom</p>
          <p className="text-sm text-[#004D40]/60 mt-1">
            The marketing automation platform for local businesses.
          </p>
          <p className="text-sm font-semibold text-[#00A5D4] mt-2">
            surfbloom.com
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper Component for Checklist Items
function ChecklistItem({ text }: { text: string }) {
  return (
    <label className="flex items-start gap-4 p-3 rounded-xl hover:bg-[#F9F5E7]/50 cursor-pointer transition-colors group print:p-2 print:hover:bg-transparent">
      <div className="relative flex items-center justify-center w-6 h-6 mt-0.5 rounded border-2 border-[#00A5D4] shrink-0 group-hover:border-[#FF6F61] transition-colors print:border-gray-400">
        <input
          type="checkbox"
          className="opacity-0 absolute w-full h-full cursor-pointer peer"
        />
        <div className="hidden peer-checked:block text-[#FF6F61] print:text-black">
          <svg
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
          >
            <path
              d="M2.5 7.5L5.5 10.5L11.5 3.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <span className="text-[#004D40]/80 font-medium text-[15px] leading-snug print:text-black">
        {text}
      </span>
    </label>
  );
}
