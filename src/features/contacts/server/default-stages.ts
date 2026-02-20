export const DEFAULT_STAGES = [
  { name: "New Lead", slug: "new_lead", color: "blue", order: 0 },
  { name: "Prospecting", slug: "prospecting", color: "violet", order: 1 },
  { name: "Appointment", slug: "appointment", color: "amber", order: 2 },
  { name: "Payment", slug: "payment", color: "emerald", order: 3 },
  { name: "Not a Fit", slug: "not_a_fit", color: "slate", order: 4 },
  { name: "Lost", slug: "lost", color: "red", order: 5 },
] as const;
