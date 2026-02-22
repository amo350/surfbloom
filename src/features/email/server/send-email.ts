import { resend } from "./resend-client";
import { prisma } from "@/lib/prisma";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromEmail: string;
  fromName?: string;
  workspaceId: string;
  contactId: string;
  campaignId?: string;
  recipientId?: string;
  tags?: Record<string, string>;
}

export interface SendEmailResult {
  success: boolean;
  emailSendId: string | null;
  providerId: string | null;
  error?: string;
}

export async function sendEmail(
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  // Create EmailSend record first (pending)
  const emailSend = await prisma.emailSend.create({
    data: {
      campaignId: options.campaignId || null,
      recipientId: options.recipientId || null,
      contactId: options.contactId,
      workspaceId: options.workspaceId,
      toEmail: options.to,
      fromEmail: options.fromEmail,
      fromName: options.fromName || null,
      subject: options.subject,
      status: "pending",
    },
  });

  try {
    const baseTags: { name: string; value: string }[] = [
      { name: "emailSendId", value: emailSend.id },
      { name: "workspaceId", value: options.workspaceId },
    ];
    if (options.campaignId) {
      baseTags.push({ name: "campaignId", value: options.campaignId });
    }
    if (options.tags) {
      for (const [key, value] of Object.entries(options.tags)) {
        baseTags.push({ name: key, value });
      }
    }

    const { data, error } = await resend.emails.send({
      from: options.fromName
        ? `${options.fromName} <${options.fromEmail}>`
        : options.fromEmail,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text || undefined,
      tags: baseTags,
    });

    if (error) {
      await prisma.emailSend.update({
        where: { id: emailSend.id },
        data: {
          status: "failed",
        },
      });

      return {
        success: false,
        emailSendId: emailSend.id,
        providerId: null,
        error: error.message,
      };
    }

    await prisma.emailSend.update({
      where: { id: emailSend.id },
      data: {
        providerId: data?.id || null,
        status: "sent",
        sentAt: new Date(),
      },
    });

    return {
      success: true,
      emailSendId: emailSend.id,
      providerId: data?.id || null,
    };
  } catch (err: any) {
    await prisma.emailSend.update({
      where: { id: emailSend.id },
      data: {
        status: "failed",
      },
    });

    return {
      success: false,
      emailSendId: emailSend.id,
      providerId: null,
      error: err?.message || "Unknown error",
    };
  }
}

/**
 * Batch send emails — processes sequentially to respect rate limits.
 * Resend free tier: 100/day, paid: 100/second.
 */
export async function sendEmailBatch(
  emails: SendEmailOptions[],
  delayMs: number = 50,
): Promise<SendEmailResult[]> {
  const results: SendEmailResult[] = [];

  for (const email of emails) {
    const result = await sendEmail(email);
    results.push(result);

    if (delayMs > 0 && emails.indexOf(email) < emails.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return results;
}
