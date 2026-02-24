import type { NodeExecutor } from "@/features/nodes/types";
import { prisma } from "@/lib/prisma";
import { loadContact, loadWorkspace } from "../lib/load-contact";
import { resolveTemplate } from "../lib/resolve-template";
import { sendEmailChannel } from "./channel";

interface SendEmailData {
  subject?: string;
  htmlBody?: string;
}

export const sendEmailExecutor: NodeExecutor<SendEmailData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(sendEmailChannel().status({ nodeId, status: "loading" }));

  try {
    const result = await step.run("send-email", async () => {
      const contact = await loadContact(context);
      if (!contact) throw new Error("No contact in workflow context");
      if (!contact.email) throw new Error("Contact has no email address");

      const workspaceId = context.workspaceId as string;
      const workspace = await loadWorkspace(workspaceId);
      if (!workspace?.fromEmail)
        throw new Error("Workspace has no from email configured");

      const templateContext = {
        ...context,
        contact,
        location_name: workspace.name,
        location_phone: workspace.phone,
      };

      const subject = resolveTemplate(data.subject || "", templateContext);
      const htmlBody = resolveTemplate(data.htmlBody || "", templateContext);

      if (!subject.trim()) throw new Error("Email subject is empty");
      if (!htmlBody.trim()) throw new Error("Email body is empty");

      const { sendMail } = await import("@/lib/mailer");
      await sendMail({
        to: contact.email,
        subject,
        text: htmlBody.replace(/<[^>]+>/g, " ").trim(),
        html: htmlBody,
      });

      // Create EmailSend record for tracking
      await prisma.emailSend.create({
        data: {
          workspaceId,
          contactId: contact.id,
          toEmail: contact.email,
          fromEmail: workspace.fromEmail,
          fromName: workspace.fromEmailName || workspace.name,
          subject,
          providerId: null,
          status: "sent",
          sentAt: new Date(),
        },
      });

      await prisma.chatContact.update({
        where: { id: contact.id },
        data: { lastContactedAt: new Date() },
      });

      return {
        ...context,
        _lastEmailTo: contact.email,
      };
    });

    await publish(sendEmailChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(sendEmailChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
