import Link from "next/link";
import { UtensilsCrossed, CalendarHeart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-transparent">
      <h1 className="font-serif text-5xl md:text-6xl text-slate-800 mb-2 tracking-tight drop-shadow-sm">
        Our Little Compass
      </h1>
      <p className="font-sans text-xl text-slate-700 mb-12 italic drop-shadow-sm">
        Where should we go next?
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full px-4">
        {/* Food Card */}
        <Link href="/cook" className="group">
          <div
            className="border-2 border-white/40 rounded-3xl p-10 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-6"
            style={{
              background: "rgba(255, 255, 255, 0.25)", // Low opacity white
              backdropFilter: "blur(12px)",             // Strong blur
              WebkitBackdropFilter: "blur(12px)"        // Safari support
            }}
          >
            <div className="bg-rose-100/80 p-5 rounded-full text-rose-600 group-hover:bg-rose-200 transition-colors shadow-inner">
              <UtensilsCrossed size={56} />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-3xl text-slate-800 font-bold">What to Cook?</h2>
              <p className="text-slate-700 font-medium">Can't decide on dinner? Let fate decide.</p>
            </div>
          </div>
        </Link>

        {/* Date Card */}
        <Link href="/date" className="group">
          <div
            className="border-2 border-white/40 rounded-3xl p-10 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-6"
            style={{
              background: "rgba(255, 255, 255, 0.25)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)"
            }}
          >
            <div className="bg-purple-100/80 p-5 rounded-full text-purple-600 group-hover:bg-purple-200 transition-colors shadow-inner">
              <CalendarHeart size={56} />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-3xl text-slate-800 font-bold">What to Do?</h2>
              <p className="text-slate-700 font-medium">Find the perfect date idea for today.</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}