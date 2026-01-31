"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Clock,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

type NotificationItem = {
  id: number;
  title: string;
  body: string;
  sender: string;
  createdAt: string;
};

type PushStatus = "loading" | "subscribed" | "not-subscribed";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("vibe");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [pushStatus, setPushStatus] = useState<PushStatus>("loading");
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const [isEnablingPush, setIsEnablingPush] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("userName") : null;
    if (stored) {
      setUserName(stored);
    }
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setPushStatus("not-subscribed");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!sub) {
          setPushStatus("not-subscribed");
          return;
        }
        const response = await fetch("/api/push/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        if (!response.ok) {
          setPushStatus("not-subscribed");
          return;
        }
        const data = await response.json().catch(() => ({}));
        setPushStatus(data?.subscribed ? "subscribed" : "not-subscribed");
      } catch {
        setPushStatus("not-subscribed");
      }
    };

    checkSubscription();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch("/api/notifications");
        if (!response.ok) {
          setNotifications([]);
          return;
        }
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
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
    } catch {
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
      const storedName = localStorage.getItem("userName");
      const resolvedName = storedName || userName;
      if (!resolvedName) {
        setPushMessage("Please set your name first.");
        setShowNameModal(true);
        return;
      }
      const supportsServiceWorker = "serviceWorker" in navigator;
      const supportsNotifications = "Notification" in window;
      const supportsPush = "PushManager" in window;
      if (!supportsNotifications || !supportsServiceWorker || !supportsPush) {
        setPushMessage("Push notifications aren't supported on this device.");
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
      if (!vapidPublicKey) {
        setPushMessage("Missing VAPID public key. Add NEXT_PUBLIC_VAPID_PUBLIC_KEY.");
        return;
      }

      setIsEnablingPush(true);
      setPushMessage("⏳ Connecting...");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushMessage(`Permission denied (${permission}). Enable notifications in browser settings.`);
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
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

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: resolvedName, subscription }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setPushMessage(data?.error || "Database error while saving subscription.");
        return;
      }
      setPushStatus("subscribed");
      setPushMessage("✅ Notifications Active");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setPushMessage(`Couldn't enable notifications: ${message}`);
    } finally {
      setIsEnablingPush(false);
    }
  };

  const tabs = useMemo(
    () => [
      { id: "vibe", label: "Vibe", icon: Sun },
      { id: "history", label: "History", icon: Clock },
      { id: "account", label: "Account", icon: User },
    ],
    []
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/settings?tab=${tab}`);
  };

  return (
    <div className="min-h-screen px-4 py-10 flex justify-center bg-transparent">
      <div className="w-full max-w-4xl">
        <header className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] backdrop-blur-md border border-white/50 rounded-full text-[var(--text-color)] text-sm font-medium shadow-sm hover:bg-white/60 transition-all"
          >
            <ArrowLeft size={16} />
            Back Home
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl text-[var(--text-color)] font-bold">Settings Hub</h1>
          <div className="w-[88px]" />
        </header>

        <div className="bg-[var(--card-bg)]/80 backdrop-blur-xl border border-white/40 rounded-3xl p-3 shadow-xl flex gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-rose-500/80 text-white shadow-lg"
                    : "text-[var(--text-color)]/80 hover:bg-white/20"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "vibe" && (
          <div className="bg-[var(--card-bg)]/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl text-[var(--text-color)] font-bold mb-1">Theme</h2>
                <p className="text-sm text-[var(--text-color)]/70">Switch between day and night moods.</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/50 text-[var(--text-color)] font-semibold hover:bg-white/40 transition-all"
              >
                {theme === "night" ? <Sun size={16} /> : <Moon size={16} />}
                {theme === "night" ? "Daylight" : "Nightfall"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-[var(--card-bg)]/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-[var(--text-color)]">
              <Bell size={18} />
              <h2 className="font-serif text-xl font-bold">Notification History</h2>
            </div>

            {pushStatus === "not-subscribed" && (
              <div className="mb-6">
                <button
                  onClick={handleEnableNotifications}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-500/20 dark:bg-rose-500/40 backdrop-blur-md border-2 border-rose-300/70 text-[var(--text-color)] font-semibold shadow-sm hover:bg-rose-500/30 transition-all"
                  disabled={isEnablingPush}
                >
                  {isEnablingPush ? "⏳ Connecting..." : "🔔 Enable Notifications"}
                </button>
                {pushMessage && (
                  <p className="mt-2 text-sm text-[var(--text-color)]/80">{pushMessage}</p>
                )}
              </div>
            )}

            {pushStatus === "subscribed" && (
              <p className="mb-6 text-sm text-[var(--text-color)]/70">🔔 Notifications Active</p>
            )}

            {isLoadingHistory ? (
              <p className="text-sm text-[var(--text-color)]/70">Loading history...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-[var(--text-color)]/70">No notifications yet.</p>
            ) : (
              <div className="space-y-4">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/20 dark:bg-slate-900/40 border border-white/40 rounded-2xl p-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-[var(--text-color)]">{item.title}</p>
                      <span className="text-xs text-[var(--text-color)]/60">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-color)]/80 mt-1">{item.body}</p>
                    <p className="text-xs text-[var(--text-color)]/60 mt-2">From: {item.sender}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "account" && (
          <div className="bg-[var(--card-bg)]/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-xl space-y-6">
            <div>
              <h2 className="font-serif text-xl text-[var(--text-color)] font-bold mb-1">Account</h2>
              <p className="text-sm text-[var(--text-color)]/70">Manage your identity and admin tools.</p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--text-color)]/70">Signed in as</p>
                <p className="text-lg font-semibold text-[var(--text-color)]">{userName || "Anonymous"}</p>
              </div>
              <button
                onClick={() => setShowNameModal(true)}
                className="px-4 py-2 rounded-full bg-white/20 border border-white/50 text-[var(--text-color)] font-semibold hover:bg-white/40 transition-all"
              >
                Change Name
              </button>
            </div>

            <Link
              href="/manage"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-rose-500/20 border border-rose-300/70 text-[var(--text-color)] font-semibold hover:bg-rose-500/30 transition-all"
            >
              <Settings size={16} />
              Open Admin Dashboard
            </Link>
          </div>
        )}
      </div>

      {showNameModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-2xl font-serif font-bold mb-2">Who are you?</h3>
            <p className="text-slate-500 mb-4 text-sm">Enter your name so we know who reviewed this!</p>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full border rounded-xl p-3 mb-4 text-center bg-[var(--input-bg)] text-[var(--text-color)] placeholder:text-slate-400"
              placeholder="Your Name"
            />
            <button
              onClick={() => {
                if (nameInput.trim()) {
                  localStorage.setItem("userName", nameInput.trim());
                  setUserName(nameInput.trim());
                  setShowNameModal(false);
                }
              }}
              className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold"
            >
              Save Name
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-rose-500 font-serif">
          Loading your compass...
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
