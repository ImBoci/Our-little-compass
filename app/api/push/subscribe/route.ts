import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY?.trim();
    const body = await request.json();
    const { subscription, user } = body || {};
    console.log("📥 Received subscription request for user:", body?.user);
    console.log("Saving sub for:", body?.user);
    console.log("[Push] VAPID keys present:", Boolean(vapidPublicKey), Boolean(vapidPrivateKey));

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription payload." }, { status: 400 });
    }

    const resolvedUser =
      typeof user === "string" && user.trim().length > 0 ? user.trim() : "Anonymous";
    const subscriptionData = JSON.stringify(subscription);
    const endpoint = subscription.endpoint as string;

    try {
      const existing = await prisma.pushSubscription.findFirst({
        where: { payload: { contains: endpoint } },
      });

      if (existing) {
        await prisma.pushSubscription.update({
          where: { id: existing.id },
          data: { user: resolvedUser, payload: subscriptionData },
        });
      } else {
        await prisma.pushSubscription.create({
          data: { user: resolvedUser, payload: subscriptionData },
        });
      }
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
