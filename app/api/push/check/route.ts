import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const coupleId = (session.user as any).coupleId;

    const body = await request.json();
    const endpoint = body?.endpoint;

    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json({ subscribed: false }, { status: 400 });
    }

    const existing = await prisma.pushSubscription.findFirst({
      where: { payload: { contains: endpoint }, coupleId },
    });

    return NextResponse.json({ subscribed: Boolean(existing) });
  } catch (error) {
    console.error("Failed to check push subscription:", error);
    return NextResponse.json({ subscribed: false }, { status: 500 });
  }
}
