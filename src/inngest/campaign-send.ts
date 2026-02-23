import { NonRetriableError } from "inngest";
import { replaceUrls } from "@/features/campaigns/lib/link-utils";
import { generateUnsubscribeToken } from "@/features/campaigns/lib/unsubscribe";
import { createCampaignLinks } from "@/features/campaigns/server/create-campaign-links";
import { updateCampaignStats } from "@/features/campaigns/server/update-campaign-stats";
import {
  fireCampaignCompleted,
  fireCampaignSent,
} from "@/features/webhooks/server/webhook-events";
import { wrapEmailHtml, htmlToPlainText } from "@/features/email/lib/email-defaults";
import { resolveEmailTemplate } from "@/features/email/server/resolve-email-template";
import { getEmailConfig } from "@/features/email/server/get-email-config";
import { sendEmail } from "@/features/email/server/send-email";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/twilio";
import { inngest } from "./client";

const BATCH_SIZE = 50;
const THROTTLE_MS = 1100; // just over 1/sec for Twilio
const SURVEY_TIMEOUT_HOURS = 72;

function isWithinSendWindow(
  windowStart: string | null,
  windowEnd: string | null,
): { allowed: boolean; waitMs: number } {
  if (!windowStart || !windowEnd) return { allowed: true, waitMs: 0 };

  const now = new Date();
  const [startH, startM] = windowStart.split(":").map(Number);
  const [endH, endM] = windowEnd.split(":").map(Number);

  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const isOvernight = endMinutes <= startMinutes;

  let allowed: boolean;
  if (isOvernight) {
    // e.g. 22:00–06:00: allowed if after start OR before end
    allowed = currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // e.g. 09:00–19:00: allowed if between start and end
    allowed = currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  if (allowed) return { allowed: true, waitMs: 0 };

  // Calculate wait until next window open
  let waitMinutes: number;
  if (currentMinutes < startMinutes) {
    waitMinutes = startMinutes - currentMinutes;
  } else {
    // After window — wait until next day's start
    waitMinutes = 24 * 60 - currentMinutes + startMinutes;
  }

  return { allowed: false, waitMs: waitMinutes * 60 * 1000 };
}

function resolveTemplate(
  template: string,
  contact: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string | null;
  },
  workspace: { name: string; twilioPhone: string },
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    switch (key) {
      case "first_name":
        return contact.firstName || "";
      case "last_name":
        return contact.lastName || "";
      case "full_name":
        return [contact.firstName, contact.lastName].filter(Boolean).join(" ");
      case "phone":
        return contact.phone || "";
      case "email":
        return contact.email || "";
      case "location_name":
        return workspace.name;
      case "location_phone":
        return workspace.twilioPhone;
      case "survey_link":
        return "{survey_link}";
      default:
        return "";
    }
  });
}

function buildSurveyUrl(
  appUrl: string,
  surveySlug: string | null,
  contactId: string | null,
  workspaceId: string,
  campaignId: string,
): string {
  const baseUrl = appUrl.replace(/\/$/, "");
  if (!surveySlug || !contactId || !baseUrl) return "";
  return `${baseUrl}/s/${surveySlug}?c=${contactId}&w=${workspaceId}&cam=${campaignId}`;
}

function formatFirstQuestionSms(
  introMessage: string,
  firstQuestion: {
    text: string;
    type: string;
    options: unknown;
  },
  totalQuestions: number,
): string {
  let text = introMessage.trim();
  text += `\n\n(1/${totalQuestions}) ${firstQuestion.text}`;

  switch (firstQuestion.type) {
    case "nps":
      text += "\n\nReply 0-10";
      break;
    case "star":
      text += "\n\nReply 1-5";
      break;
    case "multiple_choice": {
      const options = Array.isArray(firstQuestion.options)
        ? (firstQuestion.options as string[])
        : [];
      if (options.length > 0) {
        const formatted = options
          .map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`)
          .join("\n");
        text += `\n\n${formatted}`;
      }
      break;
    }
    case "yes_no":
      text += "\n\nReply Yes or No";
      break;
    case "free_text":
    default:
      break;
  }

  return text;
}

export const sendCampaign = inngest.createFunction(
  {
    id: "send-campaign",
    retries: 2,
    onFailure: async ({ event }: { event: any }) => {
      const campaignId = event.data.event.data?.campaignId;
      if (campaignId) {
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { status: "failed" },
        });
      }
    },
  },
  { event: "campaigns/send.campaign" },
  async ({ event, step }) => {
    const { campaignId } = event.data;

    if (!campaignId) {
      throw new NonRetriableError("campaignId is required");
    }

    // ─── Step 1: Load campaign + workspace ──────────────
    const campaign = await step.run("load-campaign", async () => {
      const c = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: {
          id: true,
          workspaceId: true,
          status: true,
          name: true,
          channel: true,
          messageTemplate: true,
          subject: true,
          surveyId: true,
          variantB: true,
          variantSplit: true,
          audienceType: true,
          audienceStage: true,
          audienceCategoryId: true,
          audienceInactiveDays: true,
          frequencyCapDays: true,
          sendWindowStart: true,
          sendWindowEnd: true,
          unsubscribeLink: true,
          workspace: {
            select: {
              id: true,
              name: true,
              userId: true,
              fromEmail: true,
              fromEmailName: true,
              twilioPhoneNumber: {
                select: { phoneNumber: true },
              },
            },
          },
          survey: {
            select: {
              slug: true,
            },
          },
        },
      });

      if (!c) throw new NonRetriableError("Campaign not found");
      if (!["sending"].includes(c.status)) {
        throw new NonRetriableError(
          `Campaign status is ${c.status}, not sending`,
        );
      }
      if (c.channel === "sms" && !c.workspace?.twilioPhoneNumber?.phoneNumber) {
        throw new NonRetriableError(
          "No Twilio number configured for this workspace",
        );
      }

      return {
        id: c.id,
        workspaceId: c.workspaceId,
        status: c.status,
        name: c.name,
        channel: c.channel,
        messageTemplate: c.messageTemplate,
        subject: c.subject,
        surveyId: c.surveyId,
        surveySlug: c.survey?.slug || null,
        variantB: c.variantB,
        variantSplit: c.variantSplit,
        audienceType: c.audienceType,
        audienceStage: c.audienceStage,
        audienceCategoryId: c.audienceCategoryId,
        audienceInactiveDays: c.audienceInactiveDays,
        frequencyCapDays: c.frequencyCapDays,
        sendWindowStart: c.sendWindowStart,
        sendWindowEnd: c.sendWindowEnd,
        unsubscribeLink: c.unsubscribeLink,
        workspace: c.workspace,
        workspaceName: c.workspace.name,
        twilioPhone: c.workspace.twilioPhoneNumber?.phoneNumber || "",
        workspaceUserId: c.workspace.userId,
      };
    });

    const emailConfig =
      campaign.channel === "email"
        ? await step.run("load-email-config", async () => {
            return getEmailConfig(campaign.workspaceId);
          })
        : null;

    // ─── Step 2: Build audience + create recipients ─────
    const recipientCount = await step.run("create-recipients", async () => {
      // Build audience where clause
      const where: any = {
        workspaceId: campaign.workspaceId,
        isContact: true,
        optedOut: false,
      };

      if (campaign.channel === "email") {
        where.email = { not: null };
      } else {
        where.phone = { not: null };
      }

      switch (campaign.audienceType) {
        case "stage":
          if (campaign.audienceStage) where.stage = campaign.audienceStage;
          break;
        case "category":
          if (campaign.audienceCategoryId) {
            where.categories = {
              some: { categoryId: campaign.audienceCategoryId },
            };
          }
          break;
        case "inactive":
          if (campaign.audienceInactiveDays) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - campaign.audienceInactiveDays);
            where.OR = [
              { lastContactedAt: { lt: cutoff } },
              { lastContactedAt: null },
            ];
          }
          break;
      }

      // Frequency cap
      if (campaign.frequencyCapDays) {
        const capCutoff = new Date();
        capCutoff.setDate(capCutoff.getDate() - campaign.frequencyCapDays);

        const recentlyMessaged = await prisma.campaignRecipient.findMany({
          where: {
            sentAt: { gte: capCutoff },
            status: { in: ["sent", "delivered", "replied"] },
            contact: { workspaceId: campaign.workspaceId },
          },
          select: { contactId: true },
          distinct: ["contactId"],
        });

        const excludeIds = recentlyMessaged.map((r) => r.contactId);
        if (excludeIds.length > 0) {
          where.id = { ...(where.id || {}), notIn: excludeIds };
        }
      }

      // Also exclude contacts already in this campaign (resume case)
      const existingRecipientIds = await prisma.campaignRecipient.findMany({
        where: { campaignId: campaign.id },
        select: { contactId: true },
      });
      const existingIds = existingRecipientIds.map((r) => r.contactId);
      if (existingIds.length > 0) {
        const currentNotIn = where.id?.notIn || [];
        where.id = { notIn: [...currentNotIn, ...existingIds] };
      }

      const contacts = await prisma.chatContact.findMany({
        where,
        select: { id: true },
      });

      if (contacts.length === 0) {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            status: "completed",
            completedAt: new Date(),
          },
        });
        return 0;
      }

      // Batch create recipients
      await prisma.campaignRecipient.createMany({
        data: contacts.map((c) => ({
          campaignId: campaign.id,
          contactId: c.id,
          status: "pending",
        })),
        skipDuplicates: true,
      });

      // Assign A/B variants if enabled
      if (campaign.variantB) {
        const allRecipients = await prisma.campaignRecipient.findMany({
          where: { campaignId: campaign.id, variant: null },
          select: { id: true },
          orderBy: { id: "asc" },
        });

        // Fisher-Yates shuffle, then split
        const shuffled = [...allRecipients];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const splitIndex = Math.round(
          shuffled.length * (campaign.variantSplit / 100),
        );

        const variantAIds = shuffled.slice(0, splitIndex).map((r) => r.id);
        const variantBIds = shuffled.slice(splitIndex).map((r) => r.id);

        if (variantAIds.length > 0) {
          await prisma.campaignRecipient.updateMany({
            where: { id: { in: variantAIds } },
            data: { variant: "A" },
          });
        }

        if (variantBIds.length > 0) {
          await prisma.campaignRecipient.updateMany({
            where: { id: { in: variantBIds } },
            data: { variant: "B" },
          });
        }
      }

      // Update total
      const totalRecipients = await prisma.campaignRecipient.count({
        where: { campaignId: campaign.id },
      });

      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { totalRecipients },
      });

      return totalRecipients;
    });

    await step.run("webhook-campaign-sent", async () => {
      await fireCampaignSent(
        campaign.workspaceId,
        {
          id: campaign.id,
          name: campaign.name,
          channel: campaign.channel,
        },
        recipientCount,
      );
    });

    if (recipientCount === 0) {
      return { campaignId, status: "completed", sent: 0 };
    }

    // ─── Step 2.3: Create short links for URL tracking ──
    const linkReplacements = await step.run("create-links", async () => {
      const replacements = await createCampaignLinks(
        campaign.id,
        campaign.messageTemplate,
        campaign.variantB,
      );

      // Convert Map to plain object for Inngest serialization
      const obj: Record<string, string> = {};
      for (const [key, val] of replacements) {
        obj[key] = val;
      }
      return obj;
    });

    // ─── Step 3: Send in batches ────────────────────────
    let totalSent = 0;
    let batchIndex = 0;
    let retryAttempt = 0;

    while (true) {
      const batchResult = await step.run(
        `send-batch-${batchIndex}-${retryAttempt}`,
        async () => {
          // Check business hours
          if (campaign.sendWindowStart && campaign.sendWindowEnd) {
            const { allowed } = isWithinSendWindow(
              campaign.sendWindowStart,
              campaign.sendWindowEnd,
            );

            if (!allowed) {
              return { sent: 0, done: false, reason: "outside_window" };
            }
          }

          // Check if campaign was paused/cancelled
          const current = await prisma.campaign.findUnique({
            where: { id: campaign.id },
            select: { status: true },
          });

          if (!current || current.status !== "sending") {
            return {
              sent: 0,
              done: true,
              reason: current?.status || "not found",
            };
          }

          // Get next batch of pending recipients
          const recipients = await prisma.campaignRecipient.findMany({
            where: {
              campaignId: campaign.id,
              status: "pending",
            },
            take: BATCH_SIZE,
            include: {
              contact: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                  email: true,
                },
              },
            },
          });

          if (recipients.length === 0) {
            return { sent: 0, done: true, reason: "complete" };
          }

          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
          const isLocal = /localhost|127\.0\.0\.1/i.test(appUrl);
          const statusCallbackUrl = isLocal
            ? undefined
            : `${appUrl}/api/twilio/status`;

          let batchSent = 0;
          const replacementMap = new Map(Object.entries(linkReplacements));
          const hasLinkReplacements = replacementMap.size > 0;
          let smsSurveyConfig:
            | {
                surveyId: string;
                totalQuestions: number;
                firstQuestion: {
                  id: string;
                  type: string;
                  text: string;
                  options: unknown;
                };
              }
            | null = null;

          if (campaign.channel === "sms" && campaign.surveyId) {
            const survey = await prisma.survey.findUnique({
              where: { id: campaign.surveyId },
              select: {
                id: true,
                status: true,
                _count: { select: { questions: true } },
                questions: {
                  orderBy: { order: "asc" },
                  take: 1,
                  select: {
                    id: true,
                    type: true,
                    text: true,
                    options: true,
                  },
                },
              },
            });

            if (
              survey &&
              survey.status === "active" &&
              survey.questions.length > 0 &&
              survey._count.questions > 0
            ) {
              smsSurveyConfig = {
                surveyId: survey.id,
                totalQuestions: survey._count.questions,
                firstQuestion: survey.questions[0],
              };
            }
          }

          for (const recipient of recipients) {
            try {
              const isVariantB = !!campaign.variantB && recipient.variant === "B";

              if (campaign.channel === "email") {
                if (!recipient.contact?.email) {
                  await prisma.campaignRecipient.update({
                    where: { id: recipient.id },
                    data: {
                      status: "failed",
                      failedAt: new Date(),
                      errorMessage: "No email address",
                    },
                  });
                  continue;
                }
                if (!emailConfig) {
                  throw new NonRetriableError("Missing email config");
                }

                const htmlBody = campaign.messageTemplate;
                const subjectLine =
                  isVariantB && campaign.variantB
                    ? campaign.variantB
                    : campaign.subject || "";

                const { subject: resolvedSubject, html: resolvedHtml } =
                  resolveEmailTemplate(
                    subjectLine,
                    htmlBody,
                    {
                      firstName: recipient.contact.firstName,
                      lastName: recipient.contact.lastName,
                      email: recipient.contact.email,
                    },
                    {
                      name: campaign.workspace.name,
                      phone: campaign.workspace.twilioPhoneNumber?.phoneNumber,
                    },
                  );

                const surveyUrl = buildSurveyUrl(
                  appUrl,
                  campaign.surveySlug,
                  recipient.contact.id,
                  campaign.workspaceId,
                  campaign.id,
                );
                if (
                  !surveyUrl &&
                  (resolvedSubject.includes("{survey_link}") ||
                    resolvedHtml.includes("{survey_link}"))
                ) {
                  console.warn(
                    `[CampaignSend] {survey_link} requested but no survey configured for campaign ${campaign.id}`,
                  );
                }
                const subjectWithSurvey = resolvedSubject.replace(
                  /\{survey_link\}/g,
                  surveyUrl,
                );
                const htmlWithSurvey = resolvedHtml.replace(
                  /\{survey_link\}/g,
                  surveyUrl,
                );

                let unsubscribeUrl: string | undefined;
                if (campaign.unsubscribeLink && appUrl && !isLocal) {
                  const token = generateUnsubscribeToken(recipient.contact.id);
                  unsubscribeUrl = `${appUrl}/u/${token}`;
                }

                let finalHtml = htmlWithSurvey;
                if (hasLinkReplacements) {
                  finalHtml = replaceUrls(finalHtml, replacementMap);
                }

                const wrappedHtml = wrapEmailHtml(finalHtml, {
                  unsubscribeUrl,
                  businessName: campaign.workspace.name,
                });
                const plainText = htmlToPlainText(finalHtml);

                const emailResult = await sendEmail({
                  to: recipient.contact.email,
                  subject: subjectWithSurvey,
                  html: wrappedHtml,
                  text: plainText,
                  fromEmail: emailConfig.fromEmail,
                  fromName: emailConfig.fromName,
                  workspaceId: campaign.workspaceId,
                  contactId: recipient.contact.id,
                  campaignId: campaign.id,
                  recipientId: recipient.id,
                });

                if (emailResult.success) {
                  await prisma.campaignRecipient.update({
                    where: { id: recipient.id },
                    data: {
                      status: "sent",
                      sentAt: new Date(),
                    },
                  });
                  batchSent++;
                } else {
                  await prisma.campaignRecipient.update({
                    where: { id: recipient.id },
                    data: {
                      status: "failed",
                      failedAt: new Date(),
                      errorMessage: emailResult.error || "Email send failed",
                    },
                  });
                }
              } else {
                if (!recipient.contact?.phone) {
                  await prisma.campaignRecipient.update({
                    where: { id: recipient.id },
                    data: {
                      status: "failed",
                      failedAt: new Date(),
                      errorMessage: "No phone number",
                    },
                  });
                  continue;
                }

                const template = isVariantB
                  ? campaign.variantB!
                  : campaign.messageTemplate;

                let message = resolveTemplate(template, recipient.contact, {
                  name: campaign.workspaceName,
                  twilioPhone: campaign.twilioPhone,
                });

                if (message.includes("{survey_link}")) {
                  const surveyUrl = buildSurveyUrl(
                    appUrl,
                    campaign.surveySlug,
                    recipient.contact.id,
                    campaign.workspaceId,
                    campaign.id,
                  );
                  if (!surveyUrl) {
                    console.warn(
                      `[CampaignSend] {survey_link} requested but no survey configured for campaign ${campaign.id}`,
                    );
                  }
                  message = message.replace(/\{survey_link\}/g, surveyUrl);
                }

                if (hasLinkReplacements) {
                  message = replaceUrls(message, replacementMap);
                }

                if (smsSurveyConfig) {
                  message = formatFirstQuestionSms(
                    message,
                    smsSurveyConfig.firstQuestion,
                    smsSurveyConfig.totalQuestions,
                  );
                }

                if (campaign.unsubscribeLink && appUrl && !isLocal) {
                  const unsubToken = generateUnsubscribeToken(recipient.contact.id);
                  message += `\n\nReply STOP or visit ${appUrl}/u/${unsubToken} to unsubscribe`;
                }

                const smsResult = await sendSms({
                  userId: campaign.workspaceUserId,
                  from: campaign.twilioPhone,
                  to: recipient.contact.phone,
                  body: message,
                  statusCallback: statusCallbackUrl,
                });

                if (smsSurveyConfig) {
                  const timeoutAt = new Date(
                    Date.now() + SURVEY_TIMEOUT_HOURS * 60 * 60 * 1000,
                  );
                  const now = new Date();

                  await prisma.surveyEnrollment.upsert({
                    where: {
                      surveyId_contactId_campaignId: {
                        surveyId: smsSurveyConfig.surveyId,
                        contactId: recipient.contact.id,
                        campaignId: campaign.id,
                      },
                    },
                    create: {
                      surveyId: smsSurveyConfig.surveyId,
                      contactId: recipient.contact.id,
                      workspaceId: campaign.workspaceId,
                      campaignId: campaign.id,
                      channel: "sms",
                      status: "in_progress",
                      currentStep: 1,
                      lastMessageAt: now,
                      timeoutAt,
                    },
                    update: {
                      status: "in_progress",
                      currentStep: 1,
                      lastMessageAt: now,
                      timeoutAt,
                      retryCount: 0,
                    },
                  });
                }

                const smsMessage = await prisma.smsMessage.create({
                  data: {
                    workspaceId: campaign.workspaceId,
                    direction: "outbound",
                    from: campaign.twilioPhone,
                    to: recipient.contact.phone,
                    body: message,
                    twilioSid: smsResult.sid,
                    status: "SENT",
                    chatRoomId: await findOrCreateSmsRoom(
                      campaign.workspaceId,
                      recipient.contact.id,
                    ),
                  },
                });

                await prisma.campaignRecipient.update({
                  where: { id: recipient.id },
                  data: {
                    status: "sent",
                    sentAt: new Date(),
                    smsMessageId: smsMessage.id,
                  },
                });

                batchSent++;

                // Throttle SMS only (Twilio rate limits)
                await new Promise((resolve) => setTimeout(resolve, THROTTLE_MS));
              }
            } catch (err: any) {
              console.error(`Failed to send to ${recipient.id}:`, err);
              await prisma.campaignRecipient.update({
                where: { id: recipient.id },
                data: {
                  status: "failed",
                  failedAt: new Date(),
                  errorMessage: err?.message?.slice(0, 500) || "Unknown error",
                },
              });
            }
          }

          await updateCampaignStats(campaign.id);

          return { sent: batchSent, done: false, reason: null };
        },
      );

      totalSent += batchResult.sent;

      if (batchResult.done) {
        break;
      }

      // If outside business hours, sleep until window opens
      if (batchResult.reason === "outside_window") {
        const { waitMs } = isWithinSendWindow(
          campaign.sendWindowStart,
          campaign.sendWindowEnd,
        );
        if (waitMs > 0) {
          await step.sleep(`wait-for-window-${batchIndex}-${retryAttempt}`, waitMs);
        }
        retryAttempt++;
        continue;
      }

      batchIndex++;
      retryAttempt = 0;

      // Safety: cap at 200 batches (10,000 messages)
      if (batchIndex >= 200) {
        break;
      }
    }

    // ─── Step 4: Finalize ───────────────────────────────
    await step.run("finalize", async () => {
      const current = await prisma.campaign.findUnique({
        where: { id: campaign.id },
        select: { status: true, variantB: true },
      });

      if (current?.status === "sending") {
        // Overall stats
        const stats = await prisma.campaignRecipient.groupBy({
          by: ["status"],
          where: { campaignId: campaign.id },
          _count: true,
        });

        const statMap: Record<string, number> = {};
        for (const s of stats) {
          statMap[s.status] = s._count;
        }

        const updateData: any = {
          status: "completed",
          completedAt: new Date(),
          sentCount:
            (statMap["sent"] || 0) +
            (statMap["delivered"] || 0) +
            (statMap["replied"] || 0),
          deliveredCount: statMap["delivered"] || 0,
          failedCount: statMap["failed"] || 0,
          repliedCount: statMap["replied"] || 0,
        };

        // Per-variant stats if A/B test
        if (current.variantB) {
          const variantStats = await prisma.campaignRecipient.groupBy({
            by: ["variant", "status"],
            where: { campaignId: campaign.id },
            _count: true,
          });

          const vMap: Record<string, Record<string, number>> = { A: {}, B: {} };
          for (const s of variantStats) {
            if (s.variant === "A" || s.variant === "B") {
              vMap[s.variant][s.status] = s._count;
            }
          }

          updateData.variantASent =
            (vMap.A["sent"] || 0) +
            (vMap.A["delivered"] || 0) +
            (vMap.A["replied"] || 0);
          updateData.variantADelivered = vMap.A["delivered"] || 0;
          updateData.variantAReplied = vMap.A["replied"] || 0;

          updateData.variantBSent =
            (vMap.B["sent"] || 0) +
            (vMap.B["delivered"] || 0) +
            (vMap.B["replied"] || 0);
          updateData.variantBDelivered = vMap.B["delivered"] || 0;
          updateData.variantBReplied = vMap.B["replied"] || 0;
        }

        await prisma.campaign.update({
          where: { id: campaign.id },
          data: updateData,
        });
      }
    });

    await step.run("webhook-campaign-completed", async () => {
      const final = await prisma.campaign.findUnique({
        where: { id: campaign.id },
        select: {
          status: true,
          sentCount: true,
          deliveredCount: true,
          failedCount: true,
          repliedCount: true,
        },
      });

      if (final?.status === "completed") {
        await fireCampaignCompleted(
          campaign.workspaceId,
          {
            id: campaign.id,
            name: campaign.name,
            channel: campaign.channel,
          },
          {
            sent: final.sentCount,
            delivered: final.deliveredCount,
            failed: final.failedCount,
            replied: final.repliedCount,
          },
        );
      }
    });

    return { campaignId, status: "completed", totalSent };
  },
);

// ─── Helper: find or create SMS room for inbox threading ──
async function findOrCreateSmsRoom(
  workspaceId: string,
  contactId: string,
): Promise<string | undefined> {
  // Find existing SMS room for this contact
  const existing = await prisma.chatRoom.findFirst({
    where: {
      workspaceId,
      contactId,
      channel: "sms",
    },
    select: { id: true },
  });

  if (existing) {
    // Touch updatedAt so it bubbles up in conversations
    await prisma.chatRoom.update({
      where: { id: existing.id },
      data: { updatedAt: new Date() },
    });
    return existing.id;
  }

  // Create new SMS room
  const room = await prisma.chatRoom.create({
    data: {
      workspaceId,
      contactId,
      channel: "sms",
    },
  });

  return room.id;
}
