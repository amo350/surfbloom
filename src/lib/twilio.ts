// src/lib/twilio.ts
import twilio from "twilio";
import { decrypt, encrypt } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";

// Master client — your SurfBloom Twilio account
function getMasterClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set");
  }

  return twilio(sid, token);
}

// Create a subaccount for a new customer
export async function createSubaccount(userId: string, businessName: string) {
  const master = getMasterClient();
  const friendlyName = `SurfBloom - ${businessName}`;

  const subaccount = await master.api.accounts.create({
    friendlyName,
  });

  // Store encrypted subaccount credentials
  await prisma.twilioConfig.create({
    data: {
      userId,
      subaccountSid: encrypt(subaccount.sid),
      subaccountToken: encrypt(subaccount.authToken),
      friendlyName,
    },
  });

  return {
    sid: subaccount.sid,
    friendlyName,
  };
}

// Get a client for a specific customer's subaccount
export async function getSubaccountClient(userId: string) {
  const config = await prisma.twilioConfig.findUnique({
    where: { userId },
  });

  if (!config) {
    throw new Error("Twilio subaccount not found for this user");
  }

  const sid = decrypt(config.subaccountSid);
  const token = decrypt(config.subaccountToken);

  return twilio(sid, token);
}

// Check if user has a subaccount
export async function hasSubaccount(userId: string): Promise<boolean> {
  const config = await prisma.twilioConfig.findUnique({
    where: { userId },
    select: { id: true },
  });
  return !!config;
}

export async function sendSms({
  userId,
  from,
  to,
  body,
  mediaUrl,
}: {
  userId: string;
  from: string;
  to: string;
  body: string;
  mediaUrl?: string;
}) {
  const client = await getSubaccountClient(userId);

  const messageOptions: {
    body: string;
    from: string;
    to: string;
    mediaUrl?: string[];
    statusCallback?: string;
  } = { body, from, to };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && !appUrl.includes("localhost")) {
    messageOptions.statusCallback = `${appUrl}/api/twilio/status`;
  }

  if (mediaUrl) {
    messageOptions.mediaUrl = [mediaUrl];
  }

  const message = await client.messages.create(messageOptions);

  return {
    sid: message.sid,
    status: message.status,
    dateCreated: message.dateCreated,
  };
}

// Search available numbers using the subaccount
export async function searchAvailableNumbers(
  userId: string,
  areaCode?: string,
  country: string = "US",
  type: "local" | "tollFree" = "local",
) {
  const client = await getSubaccountClient(userId);

  if (type === "tollFree") {
    return client.availablePhoneNumbers(country).tollFree.list({
      smsEnabled: true,
      limit: 10,
    });
  }

  return client.availablePhoneNumbers(country).local.list({
    areaCode: areaCode ? parseInt(areaCode) : undefined,
    smsEnabled: true,
    limit: 10,
  });
}

// Buy a number under the subaccount
export async function provisionPhoneNumber(
  userId: string,
  phoneNumber: string,
  webhookBaseUrl?: string,
) {
  const client = await getSubaccountClient(userId);

  const options: {
    phoneNumber: string;
    smsUrl?: string;
    smsMethod?: string;
  } = { phoneNumber };

  // Set inbound webhook if we have a public URL
  if (webhookBaseUrl && !webhookBaseUrl.includes("localhost")) {
    options.smsUrl = `${webhookBaseUrl}/api/twilio/inbound`;
    options.smsMethod = "POST";
  }

  const purchased = await client.incomingPhoneNumbers.create(options);

  return {
    sid: purchased.sid,
    phoneNumber: purchased.phoneNumber,
    friendlyName: purchased.friendlyName,
  };
}

export async function updateNumberWebhook(
  userId: string,
  phoneSid: string,
  webhookBaseUrl: string,
) {
  const client = await getSubaccountClient(userId);

  await client.incomingPhoneNumbers(phoneSid).update({
    smsUrl: `${webhookBaseUrl}/api/twilio/inbound`,
    smsMethod: "POST",
  });
}
