"use client";
import { useState, useEffect } from "react";
import { UtensilsCrossed, Shuffle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CookPage() {
  const [foods, setFoods] = useState<any[]>([]);
  const [randomFood, setRandomFood] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetch("/api/food").then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        setFoods(data);
        if (data.length > 0) setRandomFood(data[Math.floor(Math.random() * data.length)]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleShuffle = () => {
    if (foods.length > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        let newFood;
        do {
          newFood = foods[Math.floor(Math.random() * foods.length)];
        } while (foods.length > 1 && newFood === randomFood); // Avoid same result twice
        setRandomFood(newFood);
        setIsAnimating(false);
      }, 300); // Matches CSS duration
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-rose-800 animate-pulse">Loading Menu...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-transparent">
      <Link href="/" className="absolute top-8 left-8 text-slate-600 hover:text-rose-600 transition flex items-center gap-2 font-medium">
        <ArrowLeft size={20} /> Back Home
      </Link>

      <div className="mb-8 text-center">
        <div className="inline-block p-4 rounded-full bg-rose-100/80 text-rose-600 mb-4 shadow-lg">
          <UtensilsCrossed size={48} />
        </div>
        <h1 className="font-serif text-4xl text-slate-800 font-bold drop-shadow-sm">Tonight's Menu</h1>
      </div>

      {/* Glass Card */}
      <div
        className="w-full max-w-md p-10 rounded-3xl border-2 border-white/40 text-center relative transition-all duration-500"
        style={{
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 0 40px rgba(244, 63, 94, 0.2)"
        }}
      >
        {randomFood ? (
          <div className={`space-y-6 transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-0 scale-95 blur-md translate-y-4' : 'opacity-100 scale-100 blur-0 translate-y-0'}`}>
            <h2 className="font-serif text-4xl font-bold text-slate-900 leading-tight">
              {randomFood.name}
            </h2>
            {randomFood.description && (
              <p className="text-xl text-slate-700 font-light italic">
                "{randomFood.description}"
              </p>
            )}
          </div>
        ) : (
          <div className="text-slate-600">No foods found! Go add some.</div>
        )}
      </div>

      <button
        onClick={handleShuffle}
        className="mt-12 group relative inline-flex items-center gap-3 bg-rose-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:bg-rose-600 hover:shadow-[0_0_30px_#f43f5e]"
      >
        <Shuffle className="group-hover:rotate-180 transition-transform duration-500" />
        Shuffle Again
      </button>
    </div>
  );
}