"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Cat, HeartPulse } from "lucide-react";

const getDaysSince = (dateString?: string | null) => {
  if (!dateString) return 0;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 0;
  const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};

export default function MilestonesPage() {
  const [journeyDays, setJourneyDays] = useState<number | null>(null);
  const [bociDays, setBociDays] = useState<number | null>(null);
  const [pipiDays, setPipiDays] = useState<number | null>(null);

  useEffect(() => {
    setJourneyDays(getDaysSince(process.env.NEXT_PUBLIC_RELATIONSHIP_START_DATE));
    setBociDays(getDaysSince(process.env.NEXT_PUBLIC_BOCI_START_DATE));
    setPipiDays(getDaysSince(process.env.NEXT_PUBLIC_PIPI_START_DATE));
  }, []);

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-transparent">
      <div className="w-full max-w-4xl">
        <header className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center justify-center p-3 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-[var(--text-color)] opacity-80 hover:opacity-100 transition-all shadow-sm group"
          >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
            <span className="hidden md:inline ml-2 pr-1 font-medium">Home</span>
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl text-[var(--text-color)] font-bold text-center flex-1">
            Milestones
          </h1>
          <div className="w-[52px] md:w-[88px]" />
        </header>

        <div className="bg-[var(--card-bg)]/80 backdrop-blur-xl border border-white/40 rounded-3xl p-10 shadow-xl mb-10 text-center">
          <div className="flex items-center justify-center gap-3 text-[var(--text-color)] mb-4">
            <HeartPulse size={24} className="text-rose-400" />
            <h2 className="font-serif text-2xl md:text-3xl font-bold">Our Journey</h2>
          </div>
          <p className="text-3xl md:text-4xl font-serif text-[var(--text-color)] font-bold">
            Day {journeyDays ?? 0} of our journey
          </p>
        </div>

        <div className="mb-6 text-center">
          <h3 className="font-serif text-xl text-[var(--text-color)] font-bold">Our Furry Friends</h3>
          <p className="text-sm text-[var(--text-color)]/70">Tiny paws, big milestones.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[var(--card-bg)]/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100/80 text-rose-500 mb-4">
              <Cat size={26} />
            </div>
            <h4 className="font-serif text-xl text-[var(--text-color)] font-bold mb-2">Boci</h4>
            <p className="text-[var(--text-color)]/80">Boci has been with us for {bociDays ?? 0} days</p>
          </div>
          <div className="bg-[var(--card-bg)]/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100/80 text-purple-500 mb-4">
              <Cat size={26} />
            </div>
            <h4 className="font-serif text-xl text-[var(--text-color)] font-bold mb-2">Pipi</h4>
            <p className="text-[var(--text-color)]/80">Pipi has been with us for {pipiDays ?? 0} days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
