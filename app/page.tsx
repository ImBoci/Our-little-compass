import Link from "next/link";
import { UtensilsCrossed, CalendarHeart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="font-serif text-5xl md:text-6xl text-slate-800 mb-2 tracking-tight">
        Our Little Compass
      </h1>
      <p className="font-sans text-xl text-slate-600 mb-12 italic">
        Where should we go next?
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full px-4">
        {/* Food Card */}
        <Link href="/cook" className="group">
          <div className="bg-white/30 backdrop-blur-md border-2 border-white/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:bg-white/50 hover:scale-105 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-4">
            <div className="bg-rose-100 p-4 rounded-full text-rose-600 group-hover:bg-rose-200 transition-colors">
              <UtensilsCrossed size={48} />
            </div>
            <h2 className="font-serif text-2xl text-slate-800 font-bold">What to Cook?</h2>
            <p className="text-slate-600">Can't decide on dinner? Let fate decide.</p>
          </div>
        </Link>

        {/* Date Card */}
        <Link href="/date" className="group">
          <div className="bg-white/30 backdrop-blur-md border-2 border-white/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:bg-white/50 hover:scale-105 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-4">
            <div className="bg-purple-100 p-4 rounded-full text-purple-600 group-hover:bg-purple-200 transition-colors">
              <CalendarHeart size={48} />
            </div>
            <h2 className="font-serif text-2xl text-slate-800 font-bold">What to Do?</h2>
            <p className="text-slate-600">Find the perfect date idea for today.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}