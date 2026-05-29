"use client";

import { useState, useEffect } from "react";

export default function ClockWidget() {
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      const budapestTime = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Europe/Budapest",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setTime(budapestTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 p-3 bg-white/30 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-slate-600 rounded-2xl shadow-lg hover:bg-white/40 dark:hover:bg-slate-700/50 hover:scale-105 transition-all duration-300">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Budapest
        </span>
        <span className="text-lg font-serif font-bold text-slate-800 dark:text-slate-100">
          {time || "Loading..."}
        </span>
      </div>
    </div>
  );
}
