import { sendEmail } from "@/features/email/server/send-email";
import { resolveEmailTemplate } from "@/features/email/server/resolve-email-template";
import {
  htmlToPlainText,
  wrapEmailHtml,
} from "@/features/email/lib/email-defaults";
import { generateUnsubscribeToken } from "@/features/campaigns/lib/unsubscribe";
import { prisma } from "@/lib/prisma";

interface ExecuteStepInput {
  enrollmentId: string;
  stepId: string;
  channel: string;
  subject: string | null;
  body: string;
  contact: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string | null;
  };
  workspaceId: string;
}

interface ExecuteStepResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

function resolveSmsTokens(
  message: string,
  contact: ExecuteStepInput["contact"],
  workspace: { name: string; phone?: string | null },
): string {
  const fullName =
    [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "there";

  return message
    .replace(/\{first_name\}/g, contact.firstName || "there")
    .replace(/\{last_name\}/g, contact.lastName || "")
    .replace(/\{full_name\}/g, fullName)
    .replace(/\{phone\}/g, contact.phone || "")
    .replace(/\{email\}/g, contact.email || "")
    .replace(/\{location_name\}/g, workspace.name || "")
    .replace(/\{location_phone\}/g, workspace.phone || "");
}

export async function executeSequenceStep(
  input: ExecuteStepInput,
): Promise<ExecuteStepResult> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: input.workspaceId },
    select: {
      id: true,
      userId: true,
      name: true,
      fromEmail: true,
      fromEmailName: true,
      twilioPhoneNumber: {
        select: { phoneNumber: true },
      },
    },
  });

  if (!workspace) {
    return { success: false, error: "Workspace not found" };
  }

  if (input.channel === "email") {
    return executeEmailStep(input, workspace);
  }
  return executeSmsStep(input, workspace);
}

async function executeSmsStep(
  input: ExecuteStepInput,
  workspace: {
    id: string;
    userId: string;
    name: string;
    fromEmail: string | null;
    fromEmailName: string | null;
    twilioPhoneNumber: { phoneNumber: string } | null;
  },
): Promise<ExecuteStepResult> {
  if (!input.contact.phone) {
    return { success: false, error: "Contact has no phone number" };
  }

  if (!workspace.twilioPhoneNumber?.phoneNumber) {
    return { success: false, error: "Workspace has no Twilio number configured" };
  }

  let message = resolveSmsTokens(input.body, input.contact, {
    name: workspace.name,
    phone: workspace.twilioPhoneNumber.phoneNumber,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const isLocal = /localhost|127\.0\.0\.1/i.test(appUrl);

  if (appUrl && !isLocal) {
    try {
      const token = generateUnsubscribeToken(input.contact.id);
      message += `\n\nReply STOP or visit ${appUrl}/u/${token} to unsubscribe`;
    } catch {
      // Skip unsubscribe link when secret/env is unavailable.
    }
  }

  try {
    const { sendSms } = await import("@/lib/twilio");

    const result = await sendSms({
      to: input.contact.phone,
      body: message,
      from: workspace.twilioPhoneNumber.phoneNumber,
      userId: workspace.userId,
    });

    await prisma.chatContact
      .update({
        where: { id: input.contact.id },
        data: { lastContactedAt: new Date() },
      })
      .catch(() => {});

    await prisma.smsMessage
      .create({
        data: {
          workspaceId: input.workspaceId,
          direction: "outbound",
          from: workspace.twilioPhoneNumber.phoneNumber,
          to: input.contact.phone,
          body: message,
          twilioSid: result?.sid || null,
          status: "SENT",
        },
      })
      .catch(() => {});

    await prisma.activity
      .create({
        data: {
          contactId: input.contact.id,
          workspaceId: input.workspaceId,
          type: "sms_sent",
          description: `Sequence step: ${message.slice(0, 100)}${message.length > 100 ? "..." : ""}`,
        },
      })
      .catch(() => {});

    return {
      success: true,
      messageId: result?.sid || undefined,
    };
  } catch (err) {
    return {
      success: false,
      error:
        (err instanceof Error ? err.message : String(err)).slice(0, 500) ||
        "SMS send failed",
    };
  }
}

async function executeEmailStep(
  input: ExecuteStepInput,
  workspace: {
    id: string;
    userId: string;
    name: string;
    fromEmail: string | null;
    fromEmailName: string | null;
    twilioPhoneNumber: { phoneNumber: string } | null;
  },
): Promise<ExecuteStepResult> {
  if (!input.contact.email) {
    return { success: false, error: "Contact has no email address" };
  }

  if (!workspace.fromEmail) {
    return { success: false, error: "Workspace has no sender email configured" };
  }

  const subject = input.subject || "(no subject)";
  const resolved = resolveEmailTemplate(
    subject,
    input.body,
    {
      firstName: input.contact.firstName,
      lastName: input.contact.lastName,
      email: input.contact.email,
    },
    {
      name: workspace.name,
      phone: workspace.twilioPhoneNumber?.phoneNumber,
    },
  );

  let unsubscribeUrl: string | undefined;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const isLocal = /localhost|127\.0\.0\.1/i.test(appUrl);

  if (appUrl && !isLocal) {
    try {
      const token = generateUnsubscribeToken(input.contact.id);
      unsubscribeUrl = `${appUrl}/u/${token}`;
    } catch {
      // Skip unsubscribe link when secret/env is unavailable.
    }
  }

  const wrappedHtml = wrapEmailHtml(resolved.html, {
    unsubscribeUrl,
    businessName: workspace.name,
  });
  const plainText = htmlToPlainText(resolved.html);

  try {
    const result = await sendEmail({
      to: input.contact.email,
      subject: resolved.subject,
      html: wrappedHtml,
      text: plainText,
      fromEmail: workspace.fromEmail,
      fromName: workspace.fromEmailName || workspace.name,
      workspaceId: input.workspaceId,
      contactId: input.contact.id,
      tags: {
        enrollmentId: input.enrollmentId,
        stepId: input.stepId,
      },
    });

    await prisma.chatContact
      .update({
        where: { id: input.contact.id },
        data: { lastContactedAt: new Date() },
      })
      .catch(() => {});

    await prisma.activity
      .create({
        data: {
          contactId: input.contact.id,
          workspaceId: input.workspaceId,
          type: "email_sent",
          description: `Sequence step: ${resolved.subject}`,
        },
      })
      .catch(() => {});

    if (result.success) {
      return {
        success: true,
        messageId: result.providerId || result.emailSendId || undefined,
      };
    }

    return {
      success: false,
      error: result.error || "Email send failed",
    };
  } catch (err) {
    return {
      success: false,
      error:
        (err instanceof Error ? err.message : String(err)).slice(0, 500) ||
        "Email send failed",
    };
  }
}
