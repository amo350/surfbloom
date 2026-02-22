import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Dispatch a webhook event to all matching endpoints for a workspace.
 * Fire-and-forget — errors are logged to WebhookDelivery, never thrown.
 */
export async function dispatchWebhookEvent(
  workspaceId: string,
  event: string,
  data: Record<string, any>,
): Promise<void> {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: {
      workspaceId,
      active: true,
      events: { has: event },
    },
    select: {
      id: true,
      url: true,
      secret: true,
    },
  });

  if (endpoints.length === 0) return;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const body = JSON.stringify(payload);

  // Fire all endpoints in parallel
  await Promise.allSettled(
    endpoints.map((ep) => deliverWebhook(ep, event, body)),
  );
}

async function deliverWebhook(
  endpoint: { id: string; url: string; secret: string },
  event: string,
  body: string,
): Promise<void> {
  const signature = signPayload(body, endpoint.secret);
  const startMs = Date.now();

  let status: number | null = null;
  let responseBody: string | null = null;
  let error: string | null = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": event,
        "X-Webhook-Timestamp": new Date().toISOString(),
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    status = res.status;
    responseBody = await res.text().catch(() => null);

    // Truncate response body
    if (responseBody && responseBody.length > 1000) {
      responseBody = responseBody.slice(0, 1000);
    }
  } catch (err: any) {
    if (err?.name === "AbortError") {
      error = "Request timed out (10s)";
    } else {
      error = err?.message?.slice(0, 500) || "Network error";
    }
  }

  const duration = Date.now() - startMs;
  const isSuccess = status !== null && status >= 200 && status < 300;

  // Log delivery
  await prisma.webhookDelivery.create({
    data: {
      endpointId: endpoint.id,
      event,
      payload: body,
      status,
      responseBody,
      duration,
      error,
    },
  });

  // Update endpoint status
  if (isSuccess) {
    await prisma.webhookEndpoint.update({
      where: { id: endpoint.id },
      data: {
        lastStatus: status,
        lastError: null,
        lastFiredAt: new Date(),
        failCount: 0,
      },
    });
  } else {
    const updated = await prisma.webhookEndpoint.update({
      where: { id: endpoint.id },
      data: {
        lastStatus: status,
        lastError: error || `HTTP ${status}`,
        lastFiredAt: new Date(),
        failCount: { increment: 1 },
      },
      select: { failCount: true },
    });

    // Auto-disable after 10 consecutive failures
    if (updated.failCount >= 10) {
      await prisma.webhookEndpoint.update({
        where: { id: endpoint.id },
        data: {
          active: false,
          lastError: `Auto-disabled after ${updated.failCount} consecutive failures`,
        },
      });
    }
  }
}
