// src/lib/ai.ts
import { createXai } from "@ai-sdk/xai";
import { generateText } from "ai";

const xai = createXai({
  apiKey: process.env.XAI_API_KEY,
});

export async function getAIResponse(
  systemPrompt: string,
  chatHistory: { role: string; content: string }[],
  userMessage: string,
) {
  try {
    const { text } = await generateText({
      model: xai("grok-3-mini"),
      system: systemPrompt,
      messages: [
        ...chatHistory.map((m) => ({
          role: m.role as "assistant" | "user",
          content: m.content,
        })),
        { role: "user" as const, content: userMessage },
      ],
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[AI] Calling Grok with message:", userMessage);
      console.log("[AI] Grok response:", text);
    }
    return text || null;
  } catch (error) {
    console.error("[AI] Grok error:", error);
    return null;
  }
}
