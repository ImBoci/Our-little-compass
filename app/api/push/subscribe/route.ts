import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, user } = body || {};
    console.log("📥 Received subscription request for user:", body?.user);

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription payload." }, { status: 400 });
    }

    const resolvedUser =
      typeof user === "string" && user.trim().length > 0 ? user.trim() : "Anonymous";

    try {
      await prisma.pushSubscription.create({
        data: {
          user: resolvedUser,
          payload: JSON.stringify(subscription),
        },
      });
    } catch (dbError) {
      console.error("Failed to store push subscription (DB):", dbError);
      return NextResponse.json({ error: "Database error while saving subscription." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to store push subscription:", error);
    return NextResponse.json({ error: "Failed to store subscription." }, { status: 500 });
  }
}
