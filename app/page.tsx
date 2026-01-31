"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { UtensilsCrossed, CalendarHeart, BookHeart, Settings, Heart, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [diffDays, setDiffDays] = useState<number | null>(null);
  const [pushStatus, setPushStatus] = useState<string | null>(null);
  const [isEnablingPush, setIsEnablingPush] = useState(false);
  const [isPushActive, setIsPushActive] = useState(false);

  useEffect(() => {
    const start = process.env.NEXT_PUBLIC_RELATIONSHIP_START_DATE;
    if (start) {
      const diff = Math.floor(
        (new Date().getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
      );
      setDiffDays(diff > 0 ? diff : 0);
    } else {
      setDiffDays(0);
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    if (!base64String || base64String.trim().length === 0) {
      throw new Error("VAPID public key is missing or empty.");
    }
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    let rawData = "";
    try {
      rawData = window.atob(base64);
    } catch (error) {
      throw new Error("VAPID public key is invalid base64.");
    }
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i += 1) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleEnableNotifications = async () => {
    if (typeof window === "undefined") return;
    try {
      const supportsServiceWorker = "serviceWorker" in navigator;
      const supportsNotifications = "Notification" in window;
      const supportsPush = "PushManager" in window;
      console.log("[Push] serviceWorker supported:", supportsServiceWorker);
      console.log("[Push] notifications supported:", supportsNotifications);
      console.log("[Push] push manager supported:", supportsPush);
      console.log("[Push] existing permission:", Notification.permission);

      if (!supportsNotifications || !supportsServiceWorker || !supportsPush) {
        setPushStatus("Push notifications aren't supported on this device.");
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      console.log("[Push] VAPID public key:", vapidPublicKey);
      if (!vapidPublicKey) {
        setPushStatus("Missing VAPID public key. Add NEXT_PUBLIC_VAPID_PUBLIC_KEY.");
        return;
      }

      setIsEnablingPush(true);
      setIsPushActive(false);
      setPushStatus("⏳ Connecting...");
      const permission = await Notification.requestPermission();
      console.log("[Push] permission result:", permission);
      if (permission !== "granted") {
        setPushStatus(`Permission denied (${permission}). Enable notifications in browser settings.`);
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      console.log("[Push] service worker registered:", reg.scope);
      let waitCount = 0;
      while (!reg.active && waitCount < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        waitCount += 1;
      }
      if (!reg.active) {
        throw new Error("Service worker not active yet.");
      }
      const existing = await reg.pushManager.getSubscription();
      const subscription =
        existing ||
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));
      console.log("[Push] subscription created:", subscription);
      console.log("Subscription Object:", subscription);

      const userName = localStorage.getItem("userName") || "Anonymous";
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userName, subscription }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setPushStatus(data?.error || "Database error while saving subscription.");
        return;
      }
      setIsPushActive(true);
      setPushStatus("✅ Notifications Active");
    } catch (error) {
      console.error("[Push] enable notifications failed:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      setPushStatus(`Couldn't enable notifications: ${message}`);
    } finally {
      setIsEnablingPush(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-transparent">
      <h1 className="font-serif text-4xl md:text-6xl text-[var(--text-color)] mb-2 tracking-tight drop-shadow-sm text-balance px-2">
        Our Little Compass
      </h1>
      <div className="mt-1 mb-4 flex items-center justify-center gap-2 text-slate-500 font-serif text-center px-4">
        <Heart size={14} className="text-rose-400 animate-pulse" />
        <span>{diffDays === null ? "Day 0 of our journey together" : `Day ${diffDays} of our journey together`}</span>
      </div>
      <p className="font-sans text-xl text-slate-700 dark:text-slate-300 mb-12 italic drop-shadow-sm px-2">
        Where should we go next?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full px-4">
        {/* Food Card - Rose Neon */}
        <Link href="/cook" className="group">
          <div
            className="border-2 border-white/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/40 rounded-3xl p-10 shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-6 hover:scale-105 hover:border-rose-400 hover:shadow-[0_0_35px_rgba(244,63,94,0.6)]"
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)"
            }}
          >
            <div className="bg-rose-100/80 p-5 rounded-full text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-[0_0_20px_rgba(244,63,94,0.8)]">
              <UtensilsCrossed size={56} />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-3xl text-slate-800 dark:text-white font-bold group-hover:text-rose-600 transition-colors">What to Cook?</h2>
              <p className="text-slate-700 dark:text-slate-300 font-medium">Can't decide on dinner? Let fate decide.</p>
            </div>
          </div>
        </Link>

      {/* Memory Lane Card - Amber Glow */}
      <Link href="/memories" className="group">
        <div
          className="border-2 border-white/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/40 rounded-3xl p-10 shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-6 hover:scale-105 hover:border-amber-300 hover:shadow-[0_0_35px_rgba(251,191,36,0.6)]"
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)"
          }}
        >
          <div className="bg-amber-100/80 p-5 rounded-full text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-[0_0_20px_rgba(251,191,36,0.8)]">
            <BookHeart size={56} />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl text-slate-800 dark:text-white font-bold group-hover:text-amber-600 transition-colors">Memory Lane</h2>
            <p className="text-slate-700 dark:text-slate-300 font-medium">Relive your sweetest adventures together.</p>
          </div>
        </div>
      </Link>

        {/* Date Card - Purple Neon */}
        <Link href="/date" className="group">
          <div
            className="border-2 border-white/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/40 rounded-3xl p-10 shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-6 hover:scale-105 hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.6)]"
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)"
            }}
          >
            <div className="bg-purple-100/80 p-5 rounded-full text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-[0_0_20px_rgba(168,85,247,0.8)]">
              <CalendarHeart size={56} />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-3xl text-slate-800 dark:text-white font-bold group-hover:text-purple-600 transition-colors">What to Do?</h2>
              <p className="text-slate-700 dark:text-slate-300 font-medium">Find the perfect date idea for today.</p>
            </div>
          </div>
        </Link>
      </div>
      <div className="mt-10 flex flex-col items-center gap-3">
        <button
          onClick={handleEnableNotifications}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--card-bg)] backdrop-blur-md border border-white/50 text-[var(--text-color)] font-semibold shadow-sm hover:bg-white/40 hover:scale-105 transition-all"
          disabled={isEnablingPush}
        >
          {isEnablingPush
            ? "⏳ Connecting..."
            : isPushActive
            ? "✅ Notifications Active"
            : "🔔 Enable Notifications"}
        </button>
        {pushStatus && (
          <p className="text-sm text-[var(--text-color)]/80">{pushStatus}</p>
        )}
      </div>
      <Link
        href="/manage"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md border border-white/40 rounded-full text-slate-500 shadow-lg hover:bg-white/40 hover:scale-110 transition-all duration-300 group"
        title="Manage Database"
      >
        <Settings size={22} className="group-hover:rotate-90 transition-transform duration-500" />
      </Link>
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-md border border-white/40 rounded-full text-slate-500 shadow-lg hover:bg-white/40 hover:scale-110 transition-all duration-300"
        title="Toggle theme"
      >
        {theme === "night" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}