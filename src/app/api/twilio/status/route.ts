import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { prisma } from "@/lib/prisma";
import type { SmsStatus } from "@/generated/prisma/enums";

const STATUS_MAP: Record<string, SmsStatus> = {
  queued: "QUEUED",
  sent: "SENT",
  delivered: "DELIVERED",
  undelivered: "UNDELIVERED",
  failed: "FAILED",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const signature = req.headers.get("x-twilio-signature") || "";
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/status`;
    const params = Object.fromEntries(formData);
    const isValid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN!,
      signature,
      url,
      params,
    );
    if (!isValid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messageSid = formData.get("MessageSid") as string;
    const status = formData.get("MessageStatus") as string;

    if (!messageSid || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const mappedStatus = STATUS_MAP[status];

    if (mappedStatus) {
      await prisma.smsMessage.updateMany({
        where: { twilioSid: messageSid },
        data: { status: mappedStatus },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Twilio status webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
