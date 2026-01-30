import Link from "next/link";
import { UtensilsCrossed, CalendarHeart, BookHeart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-transparent">
      <h1 className="font-serif text-5xl md:text-6xl text-slate-800 mb-2 tracking-tight drop-shadow-sm">
        Our Little Compass
      </h1>
      <p className="font-sans text-xl text-slate-700 mb-12 italic drop-shadow-sm">
        Where should we go next?
      </p>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full px-4">
        {/* Food Card - Rose Neon */}
        <Link href="/cook" className="group">
          <div
            className="border-2 border-white/40 rounded-3xl p-10 shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-6 hover:scale-105 hover:border-rose-400 hover:shadow-[0_0_35px_rgba(244,63,94,0.6)]"
            style={{
              background: "rgba(255, 255, 255, 0.25)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)"
            }}
          >
            <div className="bg-rose-100/80 p-5 rounded-full text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-[0_0_20px_rgba(244,63,94,0.8)]">
              <UtensilsCrossed size={56} />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-3xl text-slate-800 font-bold group-hover:text-rose-600 transition-colors">What to Cook?</h2>
              <p className="text-slate-700 font-medium">Can't decide on dinner? Let fate decide.</p>
            </div>
          </div>
        </Link>

      {/* Memory Lane Card - Amber Glow */}
      <Link href="/memories" className="group">
        <div
          className="border-2 border-white/40 rounded-3xl p-10 shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-6 hover:scale-105 hover:border-amber-300 hover:shadow-[0_0_35px_rgba(251,191,36,0.6)]"
          style={{
            background: "rgba(255, 255, 255, 0.25)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)"
          }}
        >
          <div className="bg-amber-100/80 p-5 rounded-full text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-[0_0_20px_rgba(251,191,36,0.8)]">
            <BookHeart size={56} />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl text-slate-800 font-bold group-hover:text-amber-600 transition-colors">Memory Lane</h2>
            <p className="text-slate-700 font-medium">Relive your sweetest adventures together.</p>
          </div>
        </div>
      </Link>

        {/* Date Card - Purple Neon */}
        <Link href="/date" className="group">
          <div
            className="border-2 border-white/40 rounded-3xl p-10 shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-6 hover:scale-105 hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.6)]"
            style={{
              background: "rgba(255, 255, 255, 0.25)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)"
            }}
          >
            <div className="bg-purple-100/80 p-5 rounded-full text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-[0_0_20px_rgba(168,85,247,0.8)]">
              <CalendarHeart size={56} />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-3xl text-slate-800 font-bold group-hover:text-purple-600 transition-colors">What to Do?</h2>
              <p className="text-slate-700 font-medium">Find the perfect date idea for today.</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}