import { NextRequest, NextResponse } from "next/server";
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
