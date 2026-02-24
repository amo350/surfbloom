import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import { slackChannel } from "@/features/nodes/channels/slack";
import { resolveTemplate } from "@/features/nodes/actions/lib/resolve-template";
import type { NodeExecutor } from "@/features/nodes/types";

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

  const webhookTemplate = data.webhookUrl;
  const contentTemplate = data.content;

  try {
    const result = await step.run("slack-webhook", async () => {
      // Resolve both campaign tokens and Handlebars variables
      const templateContext = context as Record<string, unknown>;
      const webhookUrl = resolveTemplate(webhookTemplate, templateContext);
      if (!webhookUrl.trim()) {
        throw new Error(
          `Slack webhook URL resolved to empty string. Template="${webhookTemplate}"`,
        );
      }
      try {
        new URL(webhookUrl);
      } catch {
        throw new Error(
          `Slack webhook URL is invalid. Template="${webhookTemplate}" Resolved="${webhookUrl}"`,
        );
      }
      const rawContent = resolveTemplate(contentTemplate, templateContext);
      const content = decode(rawContent);

      // Send message to Slack webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(
          `Slack webhook request failed: ${response.status} ${response.statusText} ${responseText}`.trim(),
        );
      }

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
