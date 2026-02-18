// src/app/api/feedback/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, path } = await req.json();

    if (!workspaceId || !path) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await prisma.feedbackVisit.create({
      data: {
        workspaceId,
        path,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback track error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
