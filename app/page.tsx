"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { UtensilsCrossed, CalendarHeart, BookHeart, Menu, HeartPulse } from "lucide-react";

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("userName") : null;
    if (stored) {
      setUserName(stored);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-transparent">
      <Link
        href="/settings"
        className="fixed top-6 right-6 z-[100] flex items-center justify-center w-14 h-14 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-2 border-rose-400 dark:border-purple-500 rounded-full text-rose-600 dark:text-purple-400 shadow-[0_0_15px_rgba(225,29,72,0.2)] dark:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:scale-110 transition-all duration-300"
        title="Settings"
      >
        <Menu size={28} />
      </Link>
      <div className="w-full flex flex-col items-center pt-20">
        <h1 className="font-serif text-4xl md:text-6xl text-[var(--text-color)] mb-2 tracking-tight drop-shadow-sm text-balance px-2">
          Our Little Compass
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl w-full px-4 mt-8">
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
        {/* Journey Card - Green Glow */}
        <Link href="/milestones" className="group">
          <div
            className="border-2 border-white/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/40 rounded-3xl p-10 shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-6 hover:scale-105 hover:border-green-200 hover:shadow-[0_0_35px_rgba(34,197,94,0.4)]"
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)"
            }}
          >
            <div className="bg-green-100/80 p-5 rounded-full text-green-600 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-[0_0_20px_rgba(34,197,94,0.7)]">
              <HeartPulse size={56} />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-3xl text-slate-800 dark:text-white font-bold group-hover:text-green-600 transition-colors">Our Journey</h2>
              <p className="text-slate-700 dark:text-slate-300 font-medium">Track our milestones together.</p>
            </div>
          </div>
        </Link>
        </div>
      </div>
    </div>
  );
}