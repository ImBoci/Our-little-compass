"use client";

import { useState, useEffect, lazy, Suspense } from "react";

const Scene3D = lazy(() => import("@/components/Scene3D"));

export default function RomanticBackground() {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && window.matchMedia) {
      setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }
  }, []);

  if (!mounted) return null;

  if (reducedMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-gradient-to-br from-rose-100/40 via-white/20 to-purple-100/40 dark:from-slate-900/60 dark:via-slate-800/40 dark:to-purple-950/30" />
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1]">
      <Suspense
        fallback={
          <div className="w-full h-full bg-gradient-to-br from-rose-100/40 via-white/20 to-purple-100/40 dark:from-slate-900/60 dark:via-slate-800/40 dark:to-purple-950/30" />
        }
      >
        <Scene3D />
      </Suspense>
    </div>
  );
}
