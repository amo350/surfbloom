export type AiMode = "generate" | "analyze" | "summarize";

export interface AiPreset {
  id: string;
  label: string;
  mode: AiMode;
  systemPrompt: string;
  userPromptTemplate: string; // Handlebars against context
  description: string;
}

export const AI_PRESETS: AiPreset[] = [
  // ─── Generate ─────────────────────────────────────
  {
    id: "review_request",
    label: "Review Request",
    mode: "generate",
    description: "Draft a personalized review request message",
    systemPrompt:
      "You are a friendly business assistant. Write a short, warm SMS asking the customer to leave a Google review. Keep it under 160 characters. Be personal and grateful. Do not use exclamation marks excessively.",
    userPromptTemplate:
      "Write a review request for {{contact.firstName}} who visited {{location_name}}.",
  },
  {
    id: "welcome_message",
    label: "Welcome Message",
    mode: "generate",
    description: "Draft a welcome SMS for a new contact",
    systemPrompt:
      "You are a friendly business assistant. Write a warm welcome SMS for a new customer. Keep it under 160 characters. Include a soft call to action.",
    userPromptTemplate:
      "Write a welcome message for {{contact.firstName}} who just joined via {{contact.source}} at {{location_name}}.",
  },
  {
    id: "follow_up",
    label: "Follow-Up",
    mode: "generate",
    description: "Draft a follow-up message",
    systemPrompt:
      "You are a friendly business assistant. Write a brief follow-up SMS. Be helpful, not pushy. Keep it under 160 characters.",
    userPromptTemplate:
      "Write a follow-up for {{contact.firstName}} at {{location_name}}. They haven't responded in a few days.",
  },
  {
    id: "recovery_message",
    label: "Recovery Message",
    mode: "generate",
    description: "Draft a message to recover from a bad experience",
    systemPrompt:
      "You are an empathetic business assistant. Write a short, sincere SMS apologizing and offering to make things right. Acknowledge the issue without being defensive. Keep under 200 characters.",
    userPromptTemplate:
      'Write a recovery message for {{contact.firstName}} who left a {{review.rating}}-star review saying: "{{review.text}}". Business: {{location_name}}.',
  },
  {
    id: "re_engagement",
    label: "Re-Engagement",
    mode: "generate",
    description: "Draft a message to win back an inactive contact",
    systemPrompt:
      "You are a friendly business assistant. Write a warm re-engagement SMS for a customer who hasn't visited in a while. Include a subtle reason to come back. Keep under 160 characters.",
    userPromptTemplate:
      "Write a re-engagement message for {{contact.firstName}} at {{location_name}}. They've been inactive for a while.",
  },
  {
    id: "social_post",
    label: "Social Media Post",
    mode: "generate",
    description: "Draft a social media post",
    systemPrompt:
      "You are a social media content creator. Write an engaging post for a local business. Include a call to action. Add 2-3 relevant hashtags. Keep it concise and platform-appropriate.",
    userPromptTemplate:
      "Create a social media post for {{location_name}}. Industry: {{brand.industry}}. Tone: {{brand.tone}}.",
  },
  {
    id: "thank_you",
    label: "Thank You Response",
    mode: "generate",
    description: "Draft a thank-you for a positive review",
    systemPrompt:
      "You are a grateful business owner. Write a short, genuine thank-you response to a positive review. Reference something specific from their review if possible. Keep under 200 characters.",
    userPromptTemplate:
      'Write a thank-you response to {{review.authorName}} who left a {{review.rating}}-star review: "{{review.text}}". Business: {{location_name}}.',
  },
  {
    id: "custom_generate",
    label: "Custom Prompt",
    mode: "generate",
    description: "Write your own generation prompt",
    systemPrompt: "",
    userPromptTemplate: "",
  },

  // ─── Analyze ──────────────────────────────────────
  {
    id: "review_analysis",
    label: "Review Analysis",
    mode: "analyze",
    description: "Analyze a review for sentiment, issues, and action items",
    systemPrompt:
      "You are a business intelligence assistant. Analyze the following review and return a JSON object with: sentiment (positive/negative/neutral), issues (array of specific problems mentioned), strengths (array of positives), suggestedAction (one-sentence recommendation), urgency (low/medium/high). Return ONLY valid JSON, no markdown.",
    userPromptTemplate:
      'Analyze this {{review.rating}}-star review from {{review.authorName}}: "{{review.text}}"',
  },
  {
    id: "survey_analysis",
    label: "Survey Analysis",
    mode: "analyze",
    description: "Analyze survey responses for patterns",
    systemPrompt:
      "You are a customer feedback analyst. Analyze the survey responses and return a JSON object with: overallSentiment (positive/negative/mixed), keyThemes (array of recurring topics), actionItems (array of recommended next steps), riskLevel (low/medium/high). Return ONLY valid JSON, no markdown.",
    userPromptTemplate:
      "Analyze survey responses. Score: {{score}}, NPS category: {{npsCategory}}. Contact: {{contact.firstName}} {{contact.lastName}}.",
  },
  {
    id: "sentiment_analysis",
    label: "Sentiment Analysis",
    mode: "analyze",
    description: "Analyze text for sentiment",
    systemPrompt:
      "You are a sentiment analysis engine. Analyze the given text and return a JSON object with: sentiment (positive/negative/neutral), confidence (0-1), keywords (array of key terms), summary (one sentence). Return ONLY valid JSON, no markdown.",
    userPromptTemplate: 'Analyze the sentiment of: "{{messageBody}}"',
  },
  {
    id: "custom_analyze",
    label: "Custom Analysis",
    mode: "analyze",
    description: "Write your own analysis prompt",
    systemPrompt: "",
    userPromptTemplate: "",
  },

  // ─── Summarize ────────────────────────────────────
  {
    id: "weekly_summary",
    label: "Weekly Summary",
    mode: "summarize",
    description: "Summarize the week's activity",
    systemPrompt:
      "You are a business reporting assistant. Create a concise weekly summary in plain text. Include key metrics, highlights, and items needing attention. Keep it brief — suitable for a Slack post or SMS to the owner. No more than 5 bullet points.",
    userPromptTemplate:
      "Summarize the week for {{location_name}}. Include any available data from the workflow context.",
  },
  {
    id: "contact_summary",
    label: "Contact Summary",
    mode: "summarize",
    description: "Summarize a contact's history and status",
    systemPrompt:
      "You are a CRM assistant. Create a brief summary of this contact's relationship with the business. Include their stage, how they joined, and any notable interactions. Keep it to 2-3 sentences.",
    userPromptTemplate:
      "Summarize contact {{contact.firstName}} {{contact.lastName}}. Stage: {{contact.stage}}, Source: {{contact.source}}.",
  },
  {
    id: "custom_summarize",
    label: "Custom Summary",
    mode: "summarize",
    description: "Write your own summarization prompt",
    systemPrompt: "",
    userPromptTemplate: "",
  },
];

export function getPreset(id: string): AiPreset | undefined {
  return AI_PRESETS.find((p) => p.id === id);
}

export function getPresetsByMode(mode: AiMode): AiPreset[] {
  return AI_PRESETS.filter((p) => p.mode === mode);
}
