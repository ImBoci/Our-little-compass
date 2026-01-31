import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const endpoint = body?.endpoint;

    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json({ subscribed: false }, { status: 400 });
    }

    const existing = await prisma.pushSubscription.findFirst({
      where: { payload: { contains: endpoint } },
    });

    return NextResponse.json({ subscribed: Boolean(existing) });
  } catch (error) {
    console.error("Failed to check push subscription:", error);
    return NextResponse.json({ subscribed: false }, { status: 500 });
  }
}
