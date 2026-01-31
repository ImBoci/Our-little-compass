import { NextResponse } from "next/server";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY?.trim();
const vapidSubject = "mailto:admin@our-little-compass.app";

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

    console.log("Using Public Key:", `${vapidPublicKey.substring(0, 10)}...`);
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const subscriptions = await prisma.pushSubscription.findMany({
      where: sender ? { user: { not: sender } } : undefined,
    });
    console.log("[Push] subscriptions in DB:", subscriptions.length);
    const targets = subscriptions;
    console.log("[Push] target subscriptions:", targets.length, "sender:", sender);

    const title = "Our Little Compass";
    const payload = JSON.stringify({
      title,
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

    for (let i = 0; i < results.length; i += 1) {
      const result = results[i];
      if (result.status !== "rejected") continue;
      const target = targets[i];
      const reason = result.reason as { statusCode?: number } | undefined;
      console.error(
        "[Push] send failed:",
        { id: target?.id, user: target?.user },
        result.reason
      );
      if (target?.id && (reason?.statusCode === 410 || reason?.statusCode === 404)) {
        try {
          await prisma.pushSubscription.delete({ where: { id: target.id } });
          console.log("[Push] removed expired subscription:", target.id);
        } catch (deleteError) {
          console.error("[Push] failed to remove expired subscription:", target.id, deleteError);
        }
      }
    }

    const sent = results.filter((result) => result.status === "fulfilled").length;
    if (sent > 0) {
      await prisma.appNotification.create({
        data: {
          title,
          body: message,
          sender: typeof sender === "string" && sender.trim().length > 0 ? sender.trim() : "Anonymous",
        },
      });
    }
    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error("Failed to send push notifications:", error);
    return NextResponse.json({ error: "Failed to send push notifications." }, { status: 500 });
  }
}
