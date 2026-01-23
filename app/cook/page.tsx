"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shuffle, Sparkles, Loader2 } from "lucide-react";

interface Food {
  id: string;
  name: string;
  description: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

export default function CookPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [randomFood, setRandomFood] = useState<Food | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    const loadFoods = async () => {
      try {
        const response = await fetch("/api/food");
        if (response.ok) {
          const foodsData = await response.json();
          setFoods(foodsData);
          if (foodsData.length > 0) {
            const randomIndex = Math.floor(Math.random() * foodsData.length);
            setRandomFood(foodsData[randomIndex]);
          }
        }
      } catch (error) {
        console.error("Failed to load foods:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFoods();
  }, []);

  const pickRandomFood = () => {
    if (foods.length === 0) return;

    setIsSpinning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * foods.length);
      setRandomFood(foods[randomIndex]);
      setIsSpinning(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="font-serif text-4xl md:text-5xl text-slate-800 mb-2 tracking-tight">
        What should I cook?
      </h1>
      <p className="font-sans text-lg text-slate-600 mb-8 italic">
        Let fate decide your next meal
      </p>

      {randomFood && (
        <div className="bg-white/60 backdrop-blur-md border-2 border-white/50 rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="mb-6">
            <Sparkles className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h2 className="font-serif text-3xl font-bold text-slate-800 mb-2">
              {randomFood.name}
            </h2>
            <span className="inline-block bg-rose-100 text-rose-700 text-sm px-3 py-1 rounded-full mb-4">
              {randomFood.category}
            </span>
            {randomFood.description && (
              <p className="text-slate-600 italic text-lg">
                {randomFood.description}
              </p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={pickRandomFood}
        disabled={isSpinning || foods.length === 0}
        className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 flex items-center gap-3 mx-auto mt-8 disabled:cursor-not-allowed"
      >
        {isSpinning ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Picking your meal...
          </>
        ) : (
          <>
            <Shuffle className="w-5 h-5" />
            Shuffle Food
          </>
        )}
      </button>

      {foods.length === 0 && (
        <p className="mt-6 text-slate-600">
          No foods available.{" "}
          <Link href="/manage" className="text-rose-600 hover:underline">
            Add some foods
          </Link>{" "}
          first.
        </p>
      )}

      <Link href="/" className="mt-12 text-slate-500 hover:text-slate-700 text-sm">
        ← Back to Home
      </Link>
    </div>
  );
}