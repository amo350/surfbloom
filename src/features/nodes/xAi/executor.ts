import { createXai } from "@ai-sdk/xai";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/nodes/types";
import { xAiChannel } from "@/features/nodes/channels/xAi";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type XAiData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const xAiExecutor: NodeExecutor<XAiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    xAiChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      xAiChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Grok node: Variable name is missing");
  }
  if (!data.userPrompt) {
    await publish(
      xAiChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Grok User Prompt is missing");
  }

  //Throw if credential is missing

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "you are a helpful assistant";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  //TOTO: Fetch Credential that user selected

  const credentialValue = process.env.XAI_API_KEY!;

  const xai = createXai({
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap("xAi-generate-text", generateText, {
      model: xai(data.model || "grok-4-1-fast-reasoning"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";
    await publish(
      xAiChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error) {
    await publish(
      xAiChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
