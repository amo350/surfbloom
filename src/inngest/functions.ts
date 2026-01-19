import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createOpenAI } from '@ai-sdk/openai';
import { createXai } from '@ai-sdk/xai';

const google = createGoogleGenerativeAI()
const openAi = createOpenAI()
const xAi = createXai()

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai", retries: 5 },
  async ({ event, step }) => {
    await step.sleep('sleep', '3s')
    const {steps: geminiSteps} = await step.ai.wrap('gemini-generate-text', generateText, {
      model: google('gemini-2.5-flash'),
      system: 'You are a helpful assistant', 
      prompt: 'whats pi r squared',
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      });
    
    const {steps: openAiSteps} = await step.ai.wrap('openAi-generate-text', generateText, {
      model: openAi('gpt-4'),
      system: 'You are a helpful assistant', 
      prompt: 'what is lo que sea',
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });
    
    const {steps: xAiSteps} = await step.ai.wrap('xAi-generate-text', generateText, {
      model: xAi('grok-3'),
      system: 'You are a sports analyst', 
      prompt: 'what happened to bo nix',
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });
    
    return {openAiSteps, xAiSteps, geminiSteps};
  }
);
