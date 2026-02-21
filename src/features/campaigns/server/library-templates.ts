export const LIBRARY_TEMPLATES = [
  {
    name: "Review Request",
    category: "review_request",
    body: "Hi {first_name}, thanks for visiting {location_name}! We'd love your feedback. Could you take a moment to leave us a review? It really helps our small business grow.",
  },
  {
    name: "Review Follow-Up",
    category: "follow_up",
    body: "Hi {first_name}, just a friendly reminder — if you had a great experience at {location_name}, we'd really appreciate a quick review. Thank you!",
  },
  {
    name: "Welcome",
    category: "welcome",
    body: "Welcome to {location_name}, {first_name}! We're glad to have you. If you ever need anything, feel free to text us at this number.",
  },
  {
    name: "Promotional Offer",
    category: "promo",
    body: "Hey {first_name}! {location_name} has a special offer just for you. Reply to this text or call us at {location_phone} to learn more!",
  },
  {
    name: "Appointment Reminder",
    category: "reminder",
    body: "Hi {first_name}, this is a friendly reminder about your upcoming appointment at {location_name}. See you soon! Questions? Call {location_phone}.",
  },
  {
    name: "Re-Engagement",
    category: "re_engagement",
    body: "Hey {first_name}, it's been a while! We miss you at {location_name}. Come back and see what's new — reply to this text or call {location_phone}.",
  },
  {
    name: "Referral Request",
    category: "referral",
    body: "Hi {first_name}, enjoying {location_name}? If you know someone who'd love what we do, send them our way! We truly appreciate every referral.",
  },
] as const;

export const TEMPLATE_CATEGORIES = [
  { value: "custom", label: "Custom" },
  { value: "review_request", label: "Review Request" },
  { value: "follow_up", label: "Follow-Up" },
  { value: "welcome", label: "Welcome" },
  { value: "promo", label: "Promotional" },
  { value: "reminder", label: "Reminder" },
  { value: "re_engagement", label: "Re-Engagement" },
  { value: "referral", label: "Referral" },
] as const;
