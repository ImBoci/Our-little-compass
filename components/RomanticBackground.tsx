"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { Heart, Star } from "lucide-react";

const Scene3D = lazy(() => import("@/components/Scene3D"));

export default function RomanticBackground() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [particles, setParticles] = useState<{ id: number; left: string; size: number; duration: string; delay: string }[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined" && window.matchMedia) {
      setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }

    const checkTheme = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 15 + 10,
      duration: `${Math.random() * 10 + 10}s`,
      delay: `${Math.random() * 5}s`,
    }));
    setParticles(newParticles);

    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  if (reducedMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-gradient-to-br from-rose-100/40 via-white/20 to-purple-100/40 dark:from-slate-900/60 dark:via-slate-800/40 dark:to-purple-950/30" />
    );
  }

  return (
    <>
      {/* 2D Particle Layer (furthest back, semi-transparent) */}
      <div className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden opacity-30">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.duration, animationDelay: p.delay }}
          >
            {isDark ? (
              <Star fill="#fde047" className="text-yellow-300 opacity-80" size={p.size} />
            ) : (
              <Heart fill="#fb7185" className="text-rose-400 opacity-80" size={p.size} />
            )}
          </div>
        ))}
      </div>

      {/* 3D Scene Layer (in front of particles, behind UI) */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <Suspense
          fallback={
            <div className="w-full h-full bg-gradient-to-br from-rose-100/40 via-white/20 to-purple-100/40 dark:from-slate-900/60 dark:via-slate-800/40 dark:to-purple-950/30" />
          }
        >
          <Scene3D />
        </Suspense>
      </div>
    </>
  );
}
