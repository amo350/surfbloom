import { dispatchWebhookEvent } from "./dispatch";

// ─── Campaign Events ────────────────────────────────────

export function fireCampaignSent(
  workspaceId: string,
  campaign: { id: string; name: string; channel: string },
  recipientCount: number,
) {
  return dispatchWebhookEvent(workspaceId, "campaign.sent", {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      channel: campaign.channel,
    },
    recipientCount,
  });
}

export function fireCampaignCompleted(
  workspaceId: string,
  campaign: { id: string; name: string; channel: string },
  stats: {
    sent: number;
    delivered: number;
    failed: number;
    replied: number;
  },
) {
  return dispatchWebhookEvent(workspaceId, "campaign.completed", {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      channel: campaign.channel,
    },
    stats,
  });
}

// ─── Contact Events ─────────────────────────────────────

export function fireContactReplied(
  workspaceId: string,
  campaign: { id: string; name: string },
  contact: { id: string; firstName?: string | null; phone?: string | null },
  message: string,
) {
  return dispatchWebhookEvent(workspaceId, "contact.replied", {
    campaign: { id: campaign.id, name: campaign.name },
    contact: {
      id: contact.id,
      firstName: contact.firstName || null,
      phone: contact.phone || null,
    },
    message,
  });
}

export function fireContactClicked(
  workspaceId: string,
  campaign: { id: string; name: string },
  contact: { id: string; firstName?: string | null } | null,
  url: string,
) {
  return dispatchWebhookEvent(workspaceId, "contact.clicked", {
    campaign: { id: campaign.id, name: campaign.name },
    contact: contact ? { id: contact.id, firstName: contact.firstName || null } : null,
    url,
  });
}

export function fireContactOptedOut(
  workspaceId: string,
  contact: {
    id: string;
    firstName?: string | null;
    phone?: string | null;
    email?: string | null;
  },
  method: "sms_stop" | "unsubscribe_link" | "spam_complaint",
) {
  return dispatchWebhookEvent(workspaceId, "contact.opted_out", {
    contact: {
      id: contact.id,
      firstName: contact.firstName || null,
      phone: contact.phone || null,
      email: contact.email || null,
    },
    method,
  });
}

export function fireContactCreated(
  workspaceId: string,
  contact: {
    id: string;
    firstName?: string | null;
    phone?: string | null;
    email?: string | null;
    source?: string | null;
  },
) {
  return dispatchWebhookEvent(workspaceId, "contact.created", {
    contact: {
      id: contact.id,
      firstName: contact.firstName || null,
      phone: contact.phone || null,
      email: contact.email || null,
      source: contact.source || null,
    },
  });
}

// ─── Keyword Events ─────────────────────────────────────

export function fireKeywordJoined(
  workspaceId: string,
  keyword: string,
  contact: {
    id: string;
    phone: string;
  },
) {
  return dispatchWebhookEvent(workspaceId, "keyword.joined", {
    keyword,
    contact: {
      id: contact.id,
      phone: contact.phone,
    },
  });
}

// ─── Email Events ───────────────────────────────────────

export function fireEmailOpened(
  workspaceId: string,
  campaign: { id: string; name: string } | null,
  contact: { id: string; email: string },
) {
  return dispatchWebhookEvent(workspaceId, "email.opened", {
    campaign: campaign ? { id: campaign.id, name: campaign.name } : null,
    contact: {
      id: contact.id,
      email: contact.email,
    },
  });
}

export function fireEmailBounced(
  workspaceId: string,
  campaign: { id: string; name: string } | null,
  contact: { id: string; email: string },
) {
  return dispatchWebhookEvent(workspaceId, "email.bounced", {
    campaign: campaign ? { id: campaign.id, name: campaign.name } : null,
    contact: {
      id: contact.id,
      email: contact.email,
    },
  });
}
