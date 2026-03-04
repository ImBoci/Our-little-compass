"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Cat } from "lucide-react";
import Link from "next/link";

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * target));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };

    animationFrame = window.requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
}

export default function MilestonesPage() {
  const [targets, setTargets] = useState({ journey: 0, boci: 0, pipi: 0 });

  const journeyDays = useCountUp(targets.journey, 2500);
  const bociDays = useCountUp(targets.boci, 2000);
  const pipiDays = useCountUp(targets.pipi, 2000);

  useEffect(() => {
    const calcDays = (dateStr?: string) => {
      if (!dateStr) return 0;
      const start = new Date(dateStr);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - start.getTime());
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    setTargets({
      journey: calcDays(process.env.NEXT_PUBLIC_RELATIONSHIP_START_DATE),
      boci: calcDays(process.env.NEXT_PUBLIC_BOCI_START_DATE),
      pipi: calcDays(process.env.NEXT_PUBLIC_PIPI_START_DATE),
    });
  }, []);

  const getNextMilestone = (current: number) => {
    if (current === 0) return 0;
    const next = Math.ceil((current + 1) / 100) * 100;
    return next - current;
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-transparent">
      {/* Header */}
      <div className="w-full max-w-2xl relative flex items-center justify-center mb-8 pt-4 min-h-[50px]">
        <Link
          href="/"
          className="absolute left-0 flex items-center justify-center p-3 bg-[var(--card-bg)] backdrop-blur-md border border-white/40 rounded-full text-[var(--text-color)] hover:bg-white/50 transition-all shadow-sm group z-50"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
          <span className="hidden md:inline ml-2 pr-1 font-medium">Home</span>
        </Link>

        <h1 className="font-serif text-3xl md:text-4xl font-bold drop-shadow-sm flex items-center gap-2 text-[var(--text-color)]">
          Milestones
        </h1>
      </div>

      <div className="w-full max-w-2xl flex flex-col flex-1">
        {/* Main Journey Card */}
        <div className="bg-gradient-to-br from-rose-50/90 to-white/40 dark:from-rose-900/30 dark:to-slate-900/40 backdrop-blur-xl border border-rose-200/60 dark:border-rose-700/30 p-8 rounded-[2.5rem] shadow-xl text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent opacity-50"></div>

          <div className="inline-flex p-4 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-500 mb-4 shadow-inner">
            <Heart size={32} fill="currentColor" className="animate-pulse" />
          </div>

          <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-1">Our Journey</h2>
          <div className="font-serif text-5xl md:text-6xl font-bold text-rose-600 dark:text-rose-400 my-4 tabular-nums tracking-tight">
            Day {journeyDays}
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">of our adventure together</p>

          <div className="mt-6 inline-block bg-white/50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full text-sm text-slate-600 dark:text-slate-300 border border-white/50 dark:border-slate-600/50">
            🎉 Just <span className="font-bold text-rose-500">{getNextMilestone(targets.journey)}</span> days until {Math.ceil((targets.journey + 1) / 100) * 100}!
          </div>
        </div>

        {/* Spacer for 3D model (Tubbs) */}
        <div className="h-56 md:h-72 w-full pointer-events-none shrink-0"></div>

        {/* Pets Section */}
        <div className="w-full mt-auto pb-12">
          <h3 className="text-center text-xl font-serif font-bold text-[var(--text-color)] opacity-80 mb-4">Our Furry Friends</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Boci */}
            <div className="bg-gradient-to-br from-orange-50/90 to-white/40 dark:from-orange-900/30 dark:to-slate-900/40 backdrop-blur-md border border-orange-200/60 dark:border-orange-700/30 p-6 rounded-3xl shadow-lg text-center hover:scale-[1.02] transition-transform">
              <div className="inline-flex p-3 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-500 mb-3">
                <Cat size={24} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-1">Boci</h3>
              <div className="text-orange-500 font-bold text-3xl tabular-nums mb-2">{bociDays} days</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">The wise one 🐱</p>
            </div>

            {/* Pipi */}
            <div className="bg-gradient-to-br from-purple-50/90 to-white/40 dark:from-purple-900/30 dark:to-slate-900/40 backdrop-blur-md border border-purple-200/60 dark:border-purple-700/30 p-6 rounded-3xl shadow-lg text-center hover:scale-[1.02] transition-transform">
              <div className="inline-flex p-3 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-500 mb-3">
                <Cat size={24} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-1">Pipi</h3>
              <div className="text-purple-500 font-bold text-3xl tabular-nums mb-2">{pipiDays} days</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">The chaotic one 😺</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
