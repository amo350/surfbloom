const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  slate: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
  red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  teal: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  pink: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
};

// Fallback for hardcoded slugs (used when stages haven't loaded)
const SLUG_DEFAULTS: Record<string, { label: string; color: string }> = {
  new_lead: { label: "New Lead", color: "blue" },
  prospecting: { label: "Prospecting", color: "violet" },
  appointment: { label: "Appointment", color: "amber" },
  payment: { label: "Payment", color: "emerald" },
  not_a_fit: { label: "Not a Fit", color: "slate" },
  lost: { label: "Lost", color: "red" },
};

export function StageBadge({
  stage,
  name,
  color,
}: {
  stage: string;
  name?: string;
  color?: string;
}) {
  const fallback = SLUG_DEFAULTS[stage] || { label: stage, color: "slate" };
  const displayName = name || fallback.label;
  const displayColor = color || fallback.color;
  const colors = STAGE_COLORS[displayColor] || STAGE_COLORS.slate;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {displayName}
    </span>
  );
}
