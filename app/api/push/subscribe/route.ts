import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, user } = body || {};

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription payload." }, { status: 400 });
    }

    const resolvedUser =
      typeof user === "string" && user.trim().length > 0 ? user.trim() : "Anonymous";

    await prisma.pushSubscription.create({
      data: {
        user: resolvedUser,
        payload: JSON.stringify(subscription),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to store push subscription:", error);
    return NextResponse.json({ error: "Failed to store subscription." }, { status: 500 });
  }
}
