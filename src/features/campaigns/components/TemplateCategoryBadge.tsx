const CATEGORY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  custom: {
    label: "Custom",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  },
  review_request: {
    label: "Review Request",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  follow_up: {
    label: "Follow-Up",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  welcome: {
    label: "Welcome",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  promo: {
    label: "Promotional",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  reminder: {
    label: "Reminder",
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  re_engagement: {
    label: "Re-Engagement",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  referral: {
    label: "Referral",
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
  },
};

export function TemplateCategoryBadge({ category }: { category: string }) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.custom;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}
