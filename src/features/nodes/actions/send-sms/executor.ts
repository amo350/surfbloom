import type { NodeExecutor } from "@/features/nodes/types";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/twilio";
import { resolveTemplate } from "../lib/resolve-template";
import { sendSmsChannel } from "./channel";

interface SendSmsData {
  messageBody?: string;
}

export const sendSmsExecutor: NodeExecutor<SendSmsData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(sendSmsChannel().status({ nodeId, status: "loading" }));

  try {
    const result = await step.run("send-sms", async () => {
      const contact = context.contact as
        | {
            id: string;
            phone: string | null;
            optedOut: boolean;
          }
        | undefined;
      if (!contact) throw new Error("No contact in workflow context");
      if (!contact.phone) throw new Error("Contact has no phone number");
      if (contact.optedOut) throw new Error("Contact has opted out");

      // Compliance safety: re-check latest opt-out state before sending.
      const currentOptOut = await prisma.chatContact.findUnique({
        where: { id: contact.id },
        select: { optedOut: true },
      });
      if (currentOptOut?.optedOut) {
        throw new Error("Contact has opted out of SMS");
      }

      const workspaceId = context.workspaceId as string | undefined;
      if (!workspaceId)
        throw new Error("Missing workspaceId in workflow context");

      const workspace = context.workspace as
        | {
            userId: string | null;
            name: string;
            phone: string | null;
            twilioPhoneNumber?: { phoneNumber: string | null } | null;
          }
        | undefined;
      if (!workspace) throw new Error("Workspace not found");
      if (!workspace.userId) throw new Error("Workspace user not found");
      if (!workspace.twilioPhoneNumber?.phoneNumber) {
        throw new Error("Workspace has no Twilio phone number");
      }

      const templateContext = {
        ...context,
        contact,
        location_name: workspace.name,
        location_phone: workspace.phone,
      };

      const body = resolveTemplate(data.messageBody || "", templateContext);
      if (!body.trim()) {
        throw new Error("SMS body is empty after template resolution");
      }

      const fromPhone = workspace.twilioPhoneNumber.phoneNumber;

      const twilioResult = await sendSms({
        to: contact.phone,
        from: fromPhone,
        body,
        userId: workspace.userId,
      });

      const chatRoom = await prisma.chatRoom.upsert({
        where: {
          workspaceId_contactId_channel: {
            workspaceId,
            contactId: contact.id,
            channel: "sms",
          },
        },
        update: { updatedAt: new Date() },
        create: {
          workspaceId,
          contactId: contact.id,
          channel: "sms",
        },
      });

      await prisma.smsMessage.create({
        data: {
          workspaceId,
          chatRoomId: chatRoom.id,
          direction: "outbound",
          from: fromPhone,
          to: contact.phone,
          body,
          twilioSid: twilioResult?.sid || null,
          status: "SENT",
        },
      });

      await prisma.chatContact.update({
        where: { id: contact.id },
        data: { lastContactedAt: new Date() },
      });

      return {
        ...context,
        _lastSmsTo: contact.phone,
      };
    });

    await publish(sendSmsChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(sendSmsChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
