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
  const [couple, setCouple] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCouple() {
      try {
        const res = await fetch("/api/couple");
        if (res.ok) {
          const data = await res.json();
          setCouple(data);
        }
      } catch (error) {
        console.error("Failed to fetch couple data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCouple();
  }, []);

  const calcDays = (dateStr?: string) => {
    if (!dateStr) return 0;
    const start = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const journeyDaysTarget = calcDays(couple?.anniversary);
  const journeyDays = useCountUp(journeyDaysTarget, 2500);

  const getNextMilestone = (current: number) => {
    if (current === 0) return 100;
    const next = Math.ceil((current + 1) / 100) * 100;
    return next - current;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading milestones...</div>;
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-transparent">
      {/* Header */}
      <div className="w-full max-w-2xl relative flex items-center justify-center mb-8 pt-4 min-h-[50px]">
        <Link
          href="/"
          className="fixed top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-[var(--card-bg)] backdrop-blur-md border border-white/40 dark:border-slate-600 rounded-full text-[var(--text-color)] font-medium shadow-sm hover:bg-white/60 dark:hover:bg-slate-700/60 hover:scale-105 hover:shadow-md transition-all duration-300 group z-50"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span className="hidden md:inline ml-1">Back Home</span>
        </Link>

        <h1 className="font-serif text-3xl md:text-4xl font-bold drop-shadow-sm flex items-center gap-2 text-[var(--text-color)]">
          Milestones
        </h1>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-10 pb-20 relative z-10">

        {/* Main Journey Card */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 p-10 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent opacity-50"></div>

          <div className="inline-flex p-4 rounded-full bg-rose-100/80 dark:bg-rose-900/50 text-rose-500 mb-4 shadow-sm border border-rose-200/50 dark:border-rose-800/50">
            <Heart size={32} fill="currentColor" className="animate-pulse" />
          </div>

          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-1">Our Journey</h2>
          
          {couple?.anniversary ? (
            <>
              <div className="font-serif text-5xl md:text-7xl font-bold text-rose-600 dark:text-rose-400 my-4 tabular-nums tracking-tight">
                Day {journeyDays}
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">of our adventure together</p>

              <div className="mt-8 inline-block bg-white/60 dark:bg-slate-800/60 px-5 py-2 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 border border-white/60 dark:border-slate-600/50 shadow-sm">
                🎉 Just <span className="font-bold text-rose-500 text-base">{getNextMilestone(journeyDaysTarget)}</span> days until {Math.ceil((journeyDaysTarget + 1) / 100) * 100}!
              </div>
            </>
          ) : (
            <div className="py-8">
              <p className="text-slate-500 mb-4">You haven't set an anniversary date yet.</p>
              <Link href="/settings" className="bg-rose-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow hover:bg-rose-600 transition-colors">
                Set Anniversary
              </Link>
            </div>
          )}
        </div>

        {/* Pets Section */}
        {couple?.pets && couple.pets.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-center text-2xl font-serif font-bold text-[var(--text-color)] opacity-90 drop-shadow-sm">Our Furry Friends</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {couple.pets.map((pet: any, index: number) => {
                const colors = [
                  { bg: 'bg-orange-100/80 dark:bg-orange-900/50', border: 'border-orange-200/50 dark:border-orange-800/50', text: 'text-orange-500' },
                  { bg: 'bg-purple-100/80 dark:bg-purple-900/50', border: 'border-purple-200/50 dark:border-purple-800/50', text: 'text-purple-500' },
                  { bg: 'bg-blue-100/80 dark:bg-blue-900/50', border: 'border-blue-200/50 dark:border-blue-800/50', text: 'text-blue-500' }
                ];
                const color = colors[index % colors.length];
                
                // We calculate days synchronously here to avoid excessive hooks, or just use the same target logic
                const days = calcDays(pet.startDate);
                
                return (
                  <div key={pet.id} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 p-8 rounded-3xl shadow-xl text-center hover:scale-[1.02] transition-transform">
                    <div className={`inline-flex p-3 rounded-full ${color.bg} ${color.text} mb-4 border ${color.border}`}>
                      <Cat size={28} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-2">{pet.name}</h3>
                    <div className={`${color.text} font-bold text-4xl tabular-nums mb-2`}>{days} <span className="text-xl">days</span></div>
                    {pet.type && <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{pet.type}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
