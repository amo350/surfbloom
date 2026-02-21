import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/twilio";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const TONE_INSTRUCTIONS: Record<string, string> = {
  friendly:
    "Be warm, approachable, and conversational. Use a tone like a helpful neighbor who happens to run a business.",
  professional:
    "Be polished and clear. Respectful and businesslike, but still personable. No jargon.",
  casual:
    "Be super relaxed and natural. Like texting a friend. Short sentences, contractions, keep it breezy.",
};

/**
 * Check if a campaign reply should get an AI auto-response.
 * Returns true if handled (AI replied).
 */
export async function handleCampaignAutoReply(
  campaignId: string,
  recipientId: string,
  contactId: string,
  contactPhone: string,
  contactName: string,
  inboundMessage: string,
  workspaceUserId: string,
  workspaceName: string,
): Promise<boolean> {
  // ─── Load auto-reply config ───────────────────────────
  const autoReply = await prisma.campaignAutoReply.findUnique({
    where: { campaignId },
    select: {
      enabled: true,
      tone: true,
      context: true,
      maxReplies: true,
    },
  });

  if (!autoReply || !autoReply.enabled) return false;

  // ─── Check recipient AI reply count ───────────────────
  const recipient = await prisma.campaignRecipient.findUnique({
    where: { id: recipientId },
    select: { aiRepliesSent: true },
  });

  if (!recipient) return false;

  if (recipient.aiRepliesSent >= autoReply.maxReplies) {
    // Max reached — route to human inbox
    return false;
  }

  // ─── Load campaign message for context ────────────────
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: {
      messageTemplate: true,
      variantB: true,
      workspace: {
        select: {
          twilioPhoneNumber: { select: { phoneNumber: true } },
        },
      },
    },
  });

  if (!campaign) return false;
  const fromPhone = campaign.workspace.twilioPhoneNumber?.phoneNumber;
  if (!fromPhone) return false;

  // ─── Load conversation history (previous AI replies) ──
  const previousReplies = await prisma.campaignAutoReplyLog.findMany({
    where: { recipientId },
    orderBy: { createdAt: "asc" },
    select: {
      inboundMessage: true,
      aiResponse: true,
    },
  });

  // ─── Build AI prompt ──────────────────────────────────
  const toneInstruction =
    TONE_INSTRUCTIONS[autoReply.tone] || TONE_INSTRUCTIONS.friendly;

  const conversationHistory = previousReplies
    .map((r) => `Customer: ${r.inboundMessage}\nYou: ${r.aiResponse}`)
    .join("\n\n");

  const systemPrompt = `You are responding on behalf of ${workspaceName}, a local business. You're replying to a customer who received a marketing text and responded.

Rules:
- Output ONLY the reply text. No quotes, no explanations, no preamble.
- Keep responses under 160 characters (1 SMS segment) when possible. Never exceed 320 characters.
- Sound human, not like a chatbot. You're texting as the business.
- Never make up facts. Only use info from the business context provided.
- If you don't know something, say you'll have someone follow up.
- Never discuss being an AI. You're the business responding.
- Include a clear next step when appropriate (book, call, visit, etc.)
- No emojis unless the customer used them first.

${toneInstruction}

${autoReply.context ? `Business context: ${autoReply.context}` : ""}`;

  const userPrompt = `The business sent this campaign message:
"${campaign.messageTemplate}"

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ""}The customer ${contactName ? `(${contactName}) ` : ""}just replied:
"${inboundMessage}"

Write a short SMS reply.`;

  // ─── Generate AI response ─────────────────────────────
  let aiResponse: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 250,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    aiResponse = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    if (!aiResponse) return false;
  } catch (err) {
    console.error("AI auto-reply generation failed:", err);
    return false;
  }

  // ─── Send the reply ───────────────────────────────────
  try {
    await sendSms({
      from: fromPhone,
      to: contactPhone,
      body: aiResponse,
      userId: workspaceUserId,
    });
  } catch (err) {
    console.error("AI auto-reply send failed:", err);
    return false;
  }

  // ─── Log and update counters ──────────────────────────
  await prisma.$transaction([
    // Log the exchange
    prisma.campaignAutoReplyLog.create({
      data: {
        recipientId,
        campaignId,
        contactId,
        inboundMessage,
        aiResponse,
        tone: autoReply.tone,
      },
    }),

    // Increment recipient counter
    prisma.campaignRecipient.update({
      where: { id: recipientId },
      data: { aiRepliesSent: { increment: 1 } },
    }),
  ]);

  return true;
}
