import { NextResponse } from "next/server";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:hello@ourlittlecompass.local";

export async function POST(request: Request) {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({ error: "Missing VAPID keys." }, { status: 500 });
    }

    const body = await request.json();
    const { sender, message } = body || {};

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const subscriptions = await prisma.pushSubscription.findMany();
    console.log("[Push] subscriptions in DB:", subscriptions.length);
    const targets = subscriptions.filter((sub) => sub.user !== sender);
    console.log("[Push] target subscriptions:", targets.length, "sender:", sender);

    const payload = JSON.stringify({
      title: "Our Little Compass",
      body: message,
      url: "/",
    });

    const results = await Promise.allSettled(
      targets.map((sub) => {
        try {
          const subscription = JSON.parse(sub.payload);
          return webpush.sendNotification(subscription, payload);
        } catch (error) {
          console.error("[Push] invalid subscription payload:", sub.id, sub.user, error);
          throw error;
        }
      })
    );

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const target = targets[index];
        console.error(
          "[Push] send failed:",
          { id: target?.id, user: target?.user },
          result.reason
        );
      }
    });

    const sent = results.filter((result) => result.status === "fulfilled").length;
    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error("Failed to send push notifications:", error);
    return NextResponse.json({ error: "Failed to send push notifications." }, { status: 500 });
  }
}
