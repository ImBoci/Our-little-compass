"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Moon,
  Sun,
  Bell,
  User,
  Trash2,
  LogOut,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    initialTab === "history" ? "history" : initialTab === "account" ? "account" : "vibe"
  );
  const [theme, setTheme] = useState<"day" | "night">("day");

  const [pushStatus, setPushStatus] = useState<
    "loading" | "subscribed" | "unsubscribed" | "blocked" | "unsupported"
  >("loading");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("theme") as "day" | "night" | null;
    if (stored === "day" || stored === "night") {
      setTheme(stored);
      if (stored === "night") document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "day" ? "night" : "day";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "night") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
  }, []);

  const saveName = () => {
    if (userName.trim()) {
      localStorage.setItem("userName", userName.trim());
      setUserName(userName.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        if (
          typeof window === "undefined" ||
          !("serviceWorker" in navigator) ||
          !("PushManager" in window)
        ) {
          setPushStatus("unsupported");
          return;
        }

        if (Notification.permission === "denied") {
          setPushStatus("blocked");
          return;
        }

        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));
        const swReady = navigator.serviceWorker.ready;

        const result = await Promise.race([swReady, timeout]);

        if (!result) {
          setPushStatus("unsubscribed");
          return;
        }

        const reg = result as ServiceWorkerRegistration;
        const sub = await reg.pushManager.getSubscription();

        if (sub) {
          setPushStatus("subscribed");
        } else {
          setPushStatus("unsubscribed");
        }
      } catch (error) {
        console.error("Push check failed:", error);
        setPushStatus("unsubscribed");
      }
    };

    checkStatus();
  }, []);

  const enableNotifications = async () => {
    try {
      setPushStatus("loading");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushStatus("blocked");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
      if (!vapidKey) throw new Error("Missing Public Key");

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const currentName = localStorage.getItem("userName") || "Anonymous";

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, user: currentName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Subscribe failed");
      }

      setPushStatus("subscribed");
      alert("Notifications Enabled! 🔔");
    } catch (error) {
      console.error("Enable failed:", error);
      alert("Failed to enable notifications. Try resetting browser permissions.");
      setPushStatus("unsubscribed");
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setNotifications(data);
        });
    }
  }, [activeTab]);

  const deleteNoti = async (id: number) => {
    await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const sendTestNotification = async () => {
    const user = localStorage.getItem("userName") || "Anonymous";
    try {
      await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: user,
          message: `Test notification from ${user} 🔔`,
          url: "/settings",
          ignoreCooldown: true,
        }),
      });
    } catch (e) {
      console.error("Test send failed", e);
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-transparent">
      <header className="w-full max-w-lg flex items-center justify-between mb-8 gap-4 px-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-[var(--text-color)] font-medium shadow-sm hover:bg-white/60 hover:scale-105 hover:shadow-md transition-all duration-300 group z-50"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="hidden md:inline ml-1">Back Home</span>
        </Link>

        <h1 className="font-serif text-2xl md:text-3xl font-bold text-center flex-1 text-[var(--text-color)]">
          Settings
        </h1>

        <div className="w-12"></div>
      </header>

      <div className="flex bg-[var(--card-bg)] p-1 rounded-full mb-8 backdrop-blur-md border border-white/40 dark:border-slate-600 shadow-sm">
        <button
          onClick={() => setActiveTab("account")}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "account" ? "bg-emerald-500 text-white shadow-md" : "text-[var(--text-color)] opacity-70"}`}
        >
          Account
        </button>
        <button
          onClick={() => setActiveTab("vibe")}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "vibe" ? "bg-rose-500 text-white shadow-md" : "text-[var(--text-color)] opacity-70"}`}
        >
          Vibe
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "history" ? "bg-purple-600 text-white shadow-md" : "text-[var(--text-color)] opacity-70"}`}
        >
          History
        </button>
      </div>

      <div className="w-full max-w-lg space-y-6">
        {activeTab === "account" && (
          <div className="space-y-6">
            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-6 rounded-[2rem] shadow-xl">
              <h3 className="text-lg font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
                <User size={20} /> Your Name
              </h3>
              <div className="flex gap-2">
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="flex-1 bg-[var(--input-bg)] border border-white/40 dark:border-slate-500 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-[var(--text-color)]"
                />
                <button
                  onClick={saveName}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-md flex items-center justify-center"
                >
                  {nameSaved ? <CheckCircle size={20} /> : "Save"}
                </button>
              </div>
            </div>

            <Link
              href="/manage"
              className="block bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-5 rounded-2xl shadow-sm hover:scale-[1.02] transition-all"
            >
              <div className="flex items-center gap-3 text-[var(--text-color)]">
                <div className="bg-rose-100 dark:bg-rose-900 p-2 rounded-full text-rose-500">
                  <User size={20} />
                </div>
                <div className="flex-1 font-bold">Manage Database</div>
                <ArrowLeft className="rotate-180" size={18} />
              </div>
            </Link>

            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-6 rounded-[2rem] shadow-xl text-center">
              <h3 className="text-lg font-bold text-[var(--text-color)] mb-4 flex items-center justify-center gap-2">
                <Bell size={20} /> Push Notifications
              </h3>

              <div className="mb-6">
                {pushStatus === "loading" && (
                  <span className="text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> Checking...
                  </span>
                )}
                {pushStatus === "blocked" && (
                  <span className="text-red-500 font-medium">
                    ⚠️ Blocked. Please reset browser permissions.
                  </span>
                )}
                {pushStatus === "unsupported" && (
                  <span className="text-slate-400">Not supported on this device.</span>
                )}
                {pushStatus === "subscribed" && (
                  <span className="text-emerald-500 font-bold flex items-center justify-center gap-2">
                    ✅ Active on this device
                  </span>
                )}
                {pushStatus === "unsubscribed" && (
                  <span className="text-amber-500 font-medium">🔕 Not active</span>
                )}
              </div>

              {pushStatus === "unsubscribed" && (
                <button
                  onClick={enableNotifications}
                  className="w-full py-3 bg-gradient-to-r from-rose-400 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
                >
                  Enable Notifications
                </button>
              )}

              {pushStatus === "subscribed" && (
                <button
                  onClick={sendTestNotification}
                  className="text-xs text-slate-400 underline hover:text-purple-500"
                >
                  Test Notification
                </button>
              )}
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full py-4 rounded-2xl border-2 border-red-100 dark:border-red-900/30 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={20} /> Log Out Admin
            </button>
          </div>
        )}

        {activeTab === "vibe" && (
          <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-6 rounded-[2rem] shadow-xl flex flex-col gap-6 items-center text-center">
            <h2 className="text-xl font-bold text-[var(--text-color)]">App Theme</h2>
            <button
              onClick={toggleTheme}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-200 to-orange-400 dark:from-slate-700 dark:to-slate-900 flex items-center justify-center shadow-inner transition-all hover:scale-105"
            >
              {theme === "day" ? (
                <Sun size={40} className="text-white" />
              ) : (
                <Moon size={40} className="text-yellow-100" />
              )}
            </button>
            <p className="text-sm opacity-70 text-[var(--text-color)]">
              {theme === "day" ? "Romantic Day" : "Starry Night"}
            </p>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-3">
            {notifications.length === 0 && (
              <div className="text-center py-10 opacity-60 text-[var(--text-color)]">
                No notifications yet. 📭
              </div>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                className="bg-[var(--card-bg)] backdrop-blur-md border border-white/40 dark:border-slate-600 p-4 rounded-2xl flex justify-between items-start"
              >
                <div>
                  <h3 className="font-bold text-[var(--text-color)]">{n.title}</h3>
                  <p className="text-sm opacity-80 text-[var(--text-color)]">{n.body}</p>
                  <span className="text-[10px] opacity-50 uppercase tracking-wider text-[var(--text-color)] mt-1 block">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => deleteNoti(n.id)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-400">
          Loading...
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
