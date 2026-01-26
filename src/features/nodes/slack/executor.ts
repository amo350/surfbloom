import { decode } from "html-entities";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky from "ky";
import type { NodeExecutor } from "@/features/nodes/types";
import { slackChannel } from "@/features/nodes/channels/slack";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    slackChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  // Validate required fields
  if (!data.variableName) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Slack node: Variable name is missing");
  }

  if (!data.webhookUrl) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Slack node: Webhook URL is missing");
  }

  if (!data.content) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Slack node: Message content is missing");
  }

  try {
    const result = await step.run("slack-webhook", async () => {
      // Compile Handlebars templates
      const webhookUrl = Handlebars.compile(data.webhookUrl)(context);
      const rawContent = Handlebars.compile(data.content)(context);
      const content = decode(rawContent);

      // Send message to Slack webhook
      const response = await ky.post(webhookUrl, {
        json: {
          content: content,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();

      return {
        status: response.status,
        statusText: response.statusText,
        message: responseText || "ok",
      };
    });

    await publish(
      slackChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [data.variableName]: {
        slackMessageSent: true,
        status: result.status,
        message: result.message,
      },
    };
  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
