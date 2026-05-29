"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Users, PlusCircle, Link as LinkIcon, LogOut, Moon, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as any)?.coupleId) {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading" || (status === "authenticated" && (session?.user as any)?.coupleId)) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">Loading...</div>;
  }

  const handleCreateSpace = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/couple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Our Space" })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create space");
      }
      await update();
      router.push("/settings"); // Redirect to settings to see invite code
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/couple/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.trim() })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join space");
      }
      await update();
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-transparent">
      
      <button 
        onClick={() => signOut()}
        className="absolute top-8 left-8 flex items-center gap-2 px-5 py-2.5 bg-white/30 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-slate-600 rounded-full text-slate-700 dark:text-slate-200 font-medium shadow-sm hover:bg-white/60 dark:hover:bg-slate-700/60 hover:scale-105 hover:shadow-md transition-all duration-300 group z-50"
      >
        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span>Sign Out</span>
      </button>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-8 right-8 flex items-center justify-center p-3 bg-white/30 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-slate-600 rounded-full text-slate-700 dark:text-slate-200 shadow-sm hover:bg-white/60 dark:hover:bg-slate-700/60 hover:scale-110 transition-all duration-300 z-50"
      >
        {theme === "day" ? <Moon size={20} className="text-slate-700" /> : <Sun size={20} className="text-amber-300" />}
      </button>

      <div className="w-full max-w-md bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl border-2 border-white/50 dark:border-slate-700/50 p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
        
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 shadow-inner border border-white/50">
            <Users size={32} className="text-indigo-500" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Welcome!</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm">You need a shared space to start adding memories and meals.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100/80 border border-red-200 text-red-600 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <button
            onClick={handleCreateSpace}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
          >
            <PlusCircle size={20} /> Create a New Space
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">OR JOIN</span>
            <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
          </div>

          <form onSubmit={handleJoinSpace} className="space-y-3">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character Invite Code"
              className="w-full bg-white/50 dark:bg-slate-800/50 border-2 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-center font-mono tracking-widest border-white/60 dark:border-slate-600 focus:border-indigo-300 dark:focus:border-indigo-400 uppercase"
              maxLength={6}
              required
            />
            <button
              type="submit"
              disabled={loading || inviteCode.length < 6}
              className="w-full flex items-center justify-center gap-2 bg-slate-700 dark:bg-slate-800 text-white font-bold py-3 rounded-2xl shadow-md hover:bg-slate-800 dark:hover:bg-slate-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
            >
              <LinkIcon size={18} /> Join Space
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
