const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  new_lead: {
    label: "New Lead",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  prospecting: {
    label: "Prospecting",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  appointment: {
    label: "Appointment",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  payment: {
    label: "Payment",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  not_a_fit: {
    label: "Not a Fit",
    color: "bg-slate-50 text-slate-600 border-slate-200",
  },
  lost: { label: "Lost", color: "bg-red-50 text-red-700 border-red-200" },
};

export function StageBadge({ stage }: { stage: string }) {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.new_lead;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${config.color}`}
    >
      {config.label}
    </span>
  );
}
