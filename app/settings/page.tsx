"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft, Moon, Sun, Bell, User, Trash2, Loader2, CheckCircle, Copy, LogOut,
  AlertTriangle, Link as LinkIcon, Heart, Cat, Crown, UserMinus
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

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
    initialTab === "vibe" ? "vibe" : initialTab === "space" ? "space" : initialTab === "profile" ? "profile" : initialTab === "manage" ? "manage" : "vibe"
  );
  const [theme, setTheme] = useState<"day" | "night">("day");

  const [pushStatus, setPushStatus] = useState<"loading" | "subscribed" | "unsubscribed" | "blocked" | "unsupported">("loading");
  
  const { data: session, update } = useSession();
  const userId = (session?.user as any)?.id;

  const [userName, setUserName] = useState("");
  const [nameSaved, setNameSaved] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [couple, setCouple] = useState<any>(null);
  const [coupleLoading, setCoupleLoading] = useState(true);
  const [copyPulse, setCopyPulse] = useState(false);
  
  // Danger Zone states
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dangerLoading, setDangerLoading] = useState(false);

  // New Pet State
  const [newPetName, setNewPetName] = useState("");
  const [newPetType, setNewPetType] = useState("");
  const [newPetStartDate, setNewPetStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Admin Whitelist State
  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [newWhitelistEmail, setNewWhitelistEmail] = useState("");
  const [whitelistLoading, setWhitelistLoading] = useState(false);

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
    if (session?.user && (session.user as any).name) {
      setUserName((session.user as any).name);
    } else if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      if (storedName) setUserName(storedName);
    }
    
    if (typeof window !== "undefined") {
      setGyroEnabled(localStorage.getItem("gyroEnabled") === "true");
    }
  }, [session]);

  const fetchCouple = async () => {
    // Don't attempt if session is still loading (null)
    if (session === null) return;
    setCoupleLoading(true);
    try {
      const res = await fetch("/api/couple");
      if (res.ok) {
        const data = await res.json();
        setCouple(data);
      } else {
        // 401 = no couple assigned yet — not an error, just no space
        setCouple(null);
      }
    } catch (err) {
      console.error("Failed to fetch couple data:", err);
      setCouple(null);
    } finally {
      setCoupleLoading(false);
    }
  };

  useEffect(() => {
    fetchCouple();
  }, [session]);

  const toggleGyro = async () => {
    if (!gyroEnabled) {
      if (typeof (DeviceOrientationEvent as any) !== "undefined" && typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === "granted") {
            localStorage.setItem("gyroEnabled", "true");
            setGyroEnabled(true);
          } else {
            alert("Permission denied. You can still swipe to rotate!");
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        localStorage.setItem("gyroEnabled", "true");
        setGyroEnabled(true);
      }
    } else {
      localStorage.setItem("gyroEnabled", "false");
      setGyroEnabled(false);
    }
  };

  const saveName = async () => {
    if (!userName.trim()) return;
    const trimmed = userName.trim();
    localStorage.setItem("userName", trimmed);
    setUserName(trimmed);

    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      await update({ name: trimmed });
    } catch (e) {
      console.error("Failed to update name in DB", e);
    }

    try {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription: sub, user: trimmed }),
          });
        }
      }
    } catch (e) {}

    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
          setPushStatus("unsupported");
          return;
        }
        if (Notification.permission === "denied") {
          setPushStatus("blocked");
          return;
        }
        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));
        const result = await Promise.race([navigator.serviceWorker.ready, timeout]);
        if (!result) {
          setPushStatus("unsubscribed");
          return;
        }
        const sub = await (result as ServiceWorkerRegistration).pushManager.getSubscription();
        setPushStatus(sub ? "subscribed" : "unsubscribed");
      } catch (error) {
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
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, user: currentName }),
      });
      setPushStatus("subscribed");
      alert("Notifications Enabled! 🔔");
    } catch (error) {
      alert("Failed to enable notifications.");
      setPushStatus("unsubscribed");
    }
  };

  const sendTestNotification = async () => {
    const user = localStorage.getItem("userName") || "Anonymous";
    await fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: user, message: `Test notification from ${user} 🔔`, url: "/settings", ignoreCooldown: true }),
    });
  };

  const handleUpdateAnniversary = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    await fetch("/api/couple", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anniversary: newDate })
    });
    fetchCouple();
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim()) return;
    await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPetName, type: newPetType, startDate: newPetStartDate })
    });
    setNewPetName("");
    setNewPetType("");
    setNewPetStartDate(new Date().toISOString().split('T')[0]);
    fetchCouple();
  };

  const handleDeletePet = async (id: string) => {
    await fetch(`/api/pets?id=${id}`, { method: "DELETE" });
    fetchCouple();
  };

  const fetchWhitelist = async () => {
    if ((session?.user as any)?.role !== "ADMIN") return;
    setWhitelistLoading(true);
    try {
      const res = await fetch("/api/admin/whitelist");
      if (res.ok) {
        const data = await res.json();
        setWhitelist(data);
      }
    } catch (err) {
      console.error("Failed to fetch whitelist:", err);
    } finally {
      setWhitelistLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "admin") {
      fetchWhitelist();
    }
  }, [activeTab, session]);

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhitelistEmail.trim()) return;
    try {
      const res = await fetch("/api/admin/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newWhitelistEmail.trim() }),
      });
      if (res.ok) {
        setNewWhitelistEmail("");
        fetchWhitelist();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add email to whitelist");
      }
    } catch (err) {
      console.error("Add whitelist error:", err);
    }
  };

  const handleDeleteWhitelist = async (id: string) => {
    if (!confirm("Are you sure you want to remove this email from the whitelist?")) return;
    try {
      const res = await fetch(`/api/admin/whitelist?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchWhitelist();
      } else {
        alert("Failed to remove email from whitelist");
      }
    } catch (err) {
      console.error("Delete whitelist error:", err);
    }
  };

  const handleKickUser = async (targetUserId: string) => {
    if (!confirm("Are you sure you want to kick this member?")) return;
    await fetch("/api/couple", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kickUserId: targetUserId })
    });
    fetchCouple();
  };

  const handlePromoteOwner = async (targetUserId: string) => {
    if (!confirm("Are you sure you want to transfer ownership to this member?")) return;
    await fetch("/api/couple", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transferOwnerId: targetUserId })
    });
    fetchCouple();
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-transparent">
      <header className="w-full relative flex items-center justify-center mb-8 pt-4 min-h-[50px]">
        <Link
          href="/"
          className="fixed top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-white/30 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-slate-600 rounded-full text-[var(--text-color)] font-medium shadow-sm hover:bg-white/60 dark:hover:bg-slate-700/60 hover:scale-105 hover:shadow-md transition-all duration-300 z-50 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="hidden md:inline ml-1">Back Home</span>
        </Link>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-[var(--text-color)] text-center">Settings</h1>
      </header>

      <div className="flex flex-wrap justify-center gap-2 bg-[var(--card-bg)] p-2 rounded-3xl mb-8 backdrop-blur-md border border-white/40 dark:border-slate-600 shadow-sm max-w-2xl w-full">
        <button onClick={() => setActiveTab("vibe")} className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex-1 text-center ${activeTab === "vibe" ? "bg-rose-500 text-white shadow-md" : "text-[var(--text-color)] opacity-70"}`}>Vibe & Widgets</button>
        <button onClick={() => setActiveTab("space")} className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex-1 text-center ${activeTab === "space" ? "bg-purple-600 text-white shadow-md" : "text-[var(--text-color)] opacity-70"}`}>My Space</button>
        <button onClick={() => setActiveTab("profile")} className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex-1 text-center ${activeTab === "profile" ? "bg-emerald-500 text-white shadow-md" : "text-[var(--text-color)] opacity-70"}`}>Profile & Alerts</button>
        <button onClick={() => setActiveTab("manage")} className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex-1 text-center ${activeTab === "manage" ? "bg-blue-500 text-white shadow-md" : "text-[var(--text-color)] opacity-70"}`}>Manage Data</button>
        {(session?.user as any)?.role === "ADMIN" && (
          <button onClick={() => setActiveTab("admin")} className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex-1 text-center ${activeTab === "admin" ? "bg-indigo-600 text-white shadow-md" : "text-[var(--text-color)] opacity-70"}`}>Admin Control</button>
        )}
      </div>

      <div className="w-full max-w-lg space-y-6 pb-24">
        {/* VIBE & WIDGETS TAB */}
        {activeTab === "vibe" && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-6 rounded-[2rem] shadow-xl flex flex-col gap-6 items-center text-center">
              <h2 className="text-xl font-bold text-[var(--text-color)]">App Theme</h2>
              <button onClick={toggleTheme} className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-200 to-orange-400 dark:from-slate-700 dark:to-slate-900 flex items-center justify-center shadow-inner transition-all hover:scale-105">
                {theme === "day" ? <Sun size={40} className="text-white" /> : <Moon size={40} className="text-yellow-100" />}
              </button>
              <p className="text-sm opacity-70 text-[var(--text-color)]">{theme === "day" ? "Romantic Day" : "Starry Night"}</p>
            </div>

            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-6 rounded-[2rem] shadow-xl flex flex-col gap-4 items-center text-center">
              <h2 className="text-xl font-bold text-[var(--text-color)]">3D Phone Tilt</h2>
              <p className="text-sm opacity-70 text-[var(--text-color)]">Tilt your phone to rotate 3D models</p>
              <button onClick={toggleGyro} className={`px-6 py-3 rounded-xl font-bold shadow-md transition-all hover:scale-105 ${gyroEnabled ? "bg-emerald-500 text-white" : "bg-white/40 dark:bg-slate-700/40 text-[var(--text-color)] border border-white/50"}`}>
                {gyroEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        )}

        {/* MY SPACE TAB */}
        {activeTab === "space" && (
          coupleLoading ? (
            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-12 rounded-[2rem] shadow-xl flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
              <Loader2 className="animate-spin text-purple-600 mb-4" size={40} />
              <p className="text-sm font-medium text-[var(--text-color)] opacity-70">Loading your space details...</p>
            </div>
          ) : !couple ? (
            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-12 rounded-[2rem] shadow-xl flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
              <Heart size={40} className="text-rose-400 mb-4" />
              <h3 className="text-lg font-bold text-[var(--text-color)] mb-2">No Space Yet</h3>
              <p className="text-sm text-[var(--text-color)] opacity-70 mb-4">Create or join a space from the onboarding page to manage your shared settings.</p>
              <Link href="/onboarding" className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-purple-700 hover:scale-105 transition-all">Go to Onboarding</Link>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            {/* Invite Code */}
            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-6 rounded-[2rem] shadow-xl text-center">
              <h3 className="text-lg font-bold text-[var(--text-color)] mb-2 flex items-center justify-center gap-2"><LinkIcon size={20} /> Invite Code</h3>
              <div className="flex justify-center items-center gap-3">
                <div className="bg-[var(--input-bg)] border border-white/40 dark:border-slate-500 rounded-xl px-6 py-3 font-mono font-bold tracking-widest text-xl text-[var(--text-color)]">{couple.inviteCode}</div>
                <button onClick={() => { navigator.clipboard.writeText(couple.inviteCode); setCopyPulse(true); setTimeout(() => setCopyPulse(false), 2000); }} className={`p-3 rounded-xl transition-all shadow-md flex items-center justify-center ${copyPulse ? "bg-emerald-500 text-white" : "bg-purple-600 text-white"}`}>
                  {copyPulse ? <CheckCircle size={24} /> : <Copy size={24} />}
                </button>
              </div>
            </div>

            {/* Anniversary */}
            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-6 rounded-[2rem] shadow-xl w-full max-w-full flex-wrap">
              <h3 className="text-lg font-bold text-[var(--text-color)] mb-4 flex items-center gap-2"><Heart size={20} className="text-rose-500" /> Anniversary Date</h3>
              <input type="date" value={couple.anniversary ? new Date(couple.anniversary).toISOString().split('T')[0] : ''} onChange={handleUpdateAnniversary} className="w-full sm:w-auto max-w-md bg-[var(--input-bg)] border border-white/40 dark:border-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-[var(--text-color)]" />
            </div>

            {/* Pets */}
            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-6 rounded-[2rem] shadow-xl">
              <h3 className="text-lg font-bold text-[var(--text-color)] mb-4 flex items-center gap-2"><Cat size={20} className="text-orange-500" /> Pet Trackers</h3>
              <div className="space-y-3 mb-4">
                {couple.pets?.map((pet: any) => (
                  <div key={pet.id} className="flex items-center justify-between bg-[var(--input-bg)] border border-white/40 dark:border-slate-600 p-3 rounded-xl">
                    <div>
                      <div className="font-bold text-[var(--text-color)]">{pet.name}</div>
                      <div className="text-xs opacity-70 text-[var(--text-color)]">{pet.type || 'Pet'} • Since {new Date(pet.startDate).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => handleDeletePet(pet.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddPet} className="flex flex-col sm:flex-row gap-2">
                <input type="text" placeholder="Name" value={newPetName} onChange={(e) => setNewPetName(e.target.value)} className="flex-1 bg-[var(--input-bg)] border border-white/40 dark:border-slate-500 rounded-xl px-3 py-2 text-sm text-[var(--text-color)]" />
                <input type="text" placeholder="Type (e.g. Dog)" value={newPetType} onChange={(e) => setNewPetType(e.target.value)} className="flex-1 bg-[var(--input-bg)] border border-white/40 dark:border-slate-500 rounded-xl px-3 py-2 text-sm text-[var(--text-color)]" />
                <input type="date" value={newPetStartDate} onChange={(e) => setNewPetStartDate(e.target.value)} className="w-full sm:w-auto flex-none bg-[var(--input-bg)] border border-white/40 dark:border-slate-500 rounded-xl px-3 py-2 text-sm text-[var(--text-color)]" />
                <button type="submit" disabled={!newPetName.trim()} className="w-full sm:w-auto bg-orange-500 text-white px-4 py-2 rounded-xl font-bold disabled:opacity-50">+</button>
              </form>
            </div>

            {/* Space Members */}
            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-6 rounded-[2rem] shadow-xl">
              <h3 className="text-lg font-bold text-[var(--text-color)] mb-4 flex items-center gap-2"><User size={20} className="text-blue-500" /> Space Members</h3>
              <div className="space-y-3">
                {couple.users?.map((u: any) => {
                  const isOwner = couple.ownerId === u.id;
                  const amIOwner = couple.ownerId === userId;
                  const isMe = u.id === userId;
                  return (
                    <div key={u.id} className="flex items-center justify-between bg-[var(--input-bg)] border border-white/40 dark:border-slate-600 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-[var(--text-color)]">{u.name || "Unknown"} {isMe && "(You)"}</div>
                        {isOwner && <Crown size={16} className="text-yellow-500" />}
                      </div>
                      <div className="flex gap-2">
                        {amIOwner && !isMe && (
                          <>
                            <button onClick={() => handlePromoteOwner(u.id)} className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-lg hover:bg-yellow-500/30 font-bold">Make Owner</button>
                            <button onClick={() => handleKickUser(u.id)} className="text-xs bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/30 flex items-center gap-1"><UserMinus size={12}/> Kick</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-6 rounded-[2rem] text-center space-y-4">
              <h3 className="text-lg font-bold text-red-600 flex items-center justify-center gap-2"><AlertTriangle size={20} /> Danger Zone</h3>
              <button onClick={() => setShowLeaveModal(true)} className="w-full py-3 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 transition-all">Leave Current Space</button>
            </div>
          </div>
          )
        )}

        {/* PROFILE & ALERTS TAB */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-6 rounded-[2rem] shadow-xl">
              <div className="flex flex-col mb-4">
                <h3 className="text-lg font-bold text-[var(--text-color)] flex items-center gap-2"><User size={20} /> Your Name</h3>
                {session?.user?.email && <span className="text-sm text-[var(--text-color)] opacity-70 ml-7">{session.user.email}</span>}
              </div>
              <div className="flex gap-2">
                <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter your name" className="flex-1 bg-[var(--input-bg)] border border-white/40 dark:border-slate-500 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-[var(--text-color)]" />
                <button onClick={saveName} className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-600 shadow-md flex items-center justify-center">{nameSaved ? <CheckCircle size={20} /> : "Save"}</button>
              </div>
            </div>

            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-6 rounded-[2rem] shadow-xl text-center">
              <h3 className="text-lg font-bold text-[var(--text-color)] mb-4 flex items-center justify-center gap-2"><Bell size={20} /> Push Notifications</h3>
              <div className="mb-6">
                {pushStatus === "loading" && <span className="text-slate-500 flex justify-center gap-2"><Loader2 className="animate-spin" size={16} /> Checking...</span>}
                {pushStatus === "blocked" && <span className="text-red-500 font-medium">⚠️ Blocked. Reset browser permissions.</span>}
                {pushStatus === "unsupported" && <span className="text-slate-400">Not supported on this device.</span>}
                {pushStatus === "subscribed" && <span className="text-emerald-500 font-bold flex justify-center gap-2">✅ Active on this device</span>}
                {pushStatus === "unsubscribed" && <span className="text-amber-500 font-medium">🔕 Not active</span>}
              </div>
              {pushStatus === "unsubscribed" && <button onClick={enableNotifications} className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all">Enable Notifications</button>}
              {pushStatus === "subscribed" && <button onClick={sendTestNotification} className="text-xs text-slate-400 underline hover:text-emerald-500 mt-2">Test Notification</button>}
            </div>

            <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold shadow-md hover:bg-slate-300 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"><LogOut size={20} /> Sign Out</button>

            {/* Delete Profile is here */}
            <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-6 rounded-[2rem] text-center space-y-4">
              <button onClick={() => setShowDeleteModal(true)} className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-md transition-all">Delete My Profile Permanently</button>
            </div>
          </div>
        )}

        {/* MANAGE DATABASE TAB */}
        {activeTab === "manage" && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
             <Link href="/manage" className="block bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-6 rounded-[2rem] shadow-xl hover:scale-[1.02] transition-all">
                <div className="flex items-center gap-4 text-[var(--text-color)]">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full text-blue-500">
                    <User size={28} />
                  </div>
                  <div className="flex-1 font-bold text-xl">Manage Database</div>
                  <ArrowLeft className="rotate-180" size={24} />
                </div>
                <p className="mt-4 text-sm opacity-70 text-[var(--text-color)]">View and manage your custom Foods, Activities, and other Space data.</p>
              </Link>
          </div>
        )}

        {/* ADMIN CONTROL TAB */}
        {activeTab === "admin" && (session?.user as any)?.role === "ADMIN" && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 dark:border-slate-600 p-6 rounded-[2rem] shadow-xl">
              <h3 className="text-lg font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
                <Crown size={20} className="text-indigo-500" /> Whitelisted Emails
              </h3>
              
              {whitelistLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-indigo-500" size={24} />
                </div>
              ) : (
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
                  {whitelist.length === 0 ? (
                    <p className="text-sm text-[var(--text-color)] opacity-60 text-center py-4">No whitelisted emails yet.</p>
                  ) : (
                    whitelist.map((w: any) => (
                      <div key={w.id} className="flex items-center justify-between bg-[var(--input-bg)] border border-white/40 dark:border-slate-600 p-3 rounded-xl">
                        <span className="text-sm font-medium text-[var(--text-color)]">{w.email}</span>
                        <button onClick={() => handleDeleteWhitelist(w.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              <form onSubmit={handleAddWhitelist} className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="New Email" 
                  value={newWhitelistEmail} 
                  onChange={(e) => setNewWhitelistEmail(e.target.value)} 
                  className="flex-1 bg-[var(--input-bg)] border border-white/40 dark:border-slate-500 rounded-xl px-4 py-2 text-sm text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm">
                  Add to Whitelist
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Leave Space Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-white/20">
            <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
            <h3 className="text-2xl font-serif font-bold mb-2 text-[var(--text-color)]">Leave Space?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">You will be removed from this space. If you are the last member, all data will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLeaveModal(false)} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold" disabled={dangerLoading}>Cancel</button>
              <button onClick={async () => { setDangerLoading(true); await fetch("/api/couple", { method: "DELETE" }); window.location.href = "/onboarding"; }} className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold shadow-md" disabled={dangerLoading}>{dangerLoading ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Leave"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Profile Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-red-500/30">
            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-2xl font-serif font-bold mb-2 text-[var(--text-color)]">Delete Profile?</h3>
            <p className="text-red-500/80 mb-6 text-sm font-medium">This will permanently delete your account and all personal data.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold" disabled={dangerLoading}>Cancel</button>
              <button onClick={async () => { setDangerLoading(true); await fetch("/api/user", { method: "DELETE" }); signOut({ callbackUrl: "/login" }); }} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-md" disabled={dangerLoading}>{dangerLoading ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-400">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
