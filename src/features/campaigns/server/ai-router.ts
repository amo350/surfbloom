import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const PRESETS: Record<string, string> = {
  review_request:
    "Write an SMS asking the customer to leave a review for the business. Keep it warm and personal.",
  promo:
    "Write an SMS promoting a special offer or deal. Create urgency without being pushy.",
  welcome:
    "Write a welcome SMS for a new customer. Make them feel valued and let them know they can reach out.",
  re_engagement:
    "Write an SMS to win back a customer who hasn't visited in a while. Be friendly, not guilt-tripping.",
  appointment_reminder:
    "Write an SMS reminding the customer of an upcoming appointment. Be helpful and include a way to contact the business.",
  referral:
    "Write an SMS asking the customer to refer friends. Make it feel natural, not salesy.",
  follow_up:
    "Write a follow-up SMS after a visit. Thank them and encourage them to come back.",
  custom: "",
};

const IMPROVE_INSTRUCTIONS: Record<string, string> = {
  shorter:
    "Make this message significantly shorter and more concise. Keep the core message but cut unnecessary words.",
  casual:
    "Rewrite this in a more casual, conversational tone. Like texting a friend.",
  professional:
    "Rewrite this in a more professional, polished tone. Still warm but more businesslike.",
  urgent:
    "Add a sense of urgency to this message. Make the reader want to act now.",
  friendly:
    "Make this warmer and more personal. Like it's coming from someone who genuinely cares.",
};

const SYSTEM_PROMPT = `You are an SMS copywriter for local businesses (restaurants, dental offices, salons, home services).

Rules:
- Output ONLY the message text. No quotes, no explanations, no preamble.
- Use these tokens for personalization: {first_name}, {last_name}, {full_name}, {location_name}, {location_phone}
- Always use {first_name} and {location_name} when appropriate
- Keep messages under 160 characters when possible (1 SMS segment)
- Never exceed 320 characters (2 segments max)
- Sound human, not corporate. These are texts from a local business.
- No hashtags, no emojis unless specifically asked
- No ALL CAPS words
- Include a clear call to action`;

export const aiRouter = createTRPCRouter({
  // ─── GENERATE ─────────────────────────────────────────
  generateMessage: protectedProcedure
    .input(
      z.object({
        preset: z.string().optional(),
        prompt: z.string().max(500).optional(),
        businessName: z.string().optional(),
        businessType: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const presetInstruction = input.preset ? PRESETS[input.preset] || "" : "";
      if (!presetInstruction && !input.prompt?.trim()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Provide a preset or custom prompt",
        });
      }

      const userPrompt = [
        presetInstruction,
        input.prompt ? `Additional instructions: ${input.prompt}` : "",
        input.businessName
          ? `Business name: ${input.businessName} (use {location_name} token instead of the actual name)`
          : "",
        input.businessType ? `Business type: ${input.businessType}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      if (!userPrompt.trim()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Provide a preset or custom prompt",
        });
      }

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });

      let text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();

      if (!text) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI generated an empty message. Try a different prompt.",
        });
      }

      if (text.length > 320) {
        const truncated = text.slice(0, 317);
        const lastSpace = truncated.lastIndexOf(" ");
        text =
          lastSpace > 200
            ? `${truncated.slice(0, lastSpace)}...`
            : `${truncated}...`;
      }

      return { message: text, tokens: response.usage };
    }),

  // ─── IMPROVE ──────────────────────────────────────────
  improveMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(1600),
        instruction: z.enum([
          "shorter",
          "casual",
          "professional",
          "urgent",
          "friendly",
        ]),
      }),
    )
    .mutation(async ({ input }) => {
      const instruction = IMPROVE_INSTRUCTIONS[input.instruction];

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Here is an existing SMS message:\n\n${input.message}\n\n${instruction}\n\nOutput ONLY the rewritten message. No explanations.`,
          },
        ],
      });

      let text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();

      if (!text) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI generated an empty message. Try a different prompt.",
        });
      }

      if (text.length > 320) {
        const truncated = text.slice(0, 317);
        const lastSpace = truncated.lastIndexOf(" ");
        text =
          lastSpace > 200
            ? `${truncated.slice(0, lastSpace)}...`
            : `${truncated}...`;
      }

      return { message: text, tokens: response.usage };
    }),
});
