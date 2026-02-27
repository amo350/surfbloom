const INDUSTRIES = [
  "Dental",
  "Home Services",
  "Healthcare",
  "Storage",
  "Real Estate",
  "Automotive",
  "Fitness & Wellness",
  "Financial Services",
  "Legal",
  "Retail",
  "Property Management",
  "Food & Hospitality",
];

const MARQUEE_ITEMS = [...INDUSTRIES, ...INDUSTRIES];

export default function IndustryMarquee() {
  return (
    <section className="relative z-20 bg-[#F9F5E7] py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-4 text-center text-xs tracking-[0.2em] text-[#004D40]/70 uppercase">
          Built for local industries
        </p>
        <div className="marketing-marquee-viewport">
          <div className="marketing-marquee-track">
            {MARQUEE_ITEMS.map((industry, index) => (
              <span key={`${industry}-${index}`} className="m-tag">
                {industry}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
