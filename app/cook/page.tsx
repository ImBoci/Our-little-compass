'use client'

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FoodSpinner } from "@/components/FoodSpinner";
import { getFoods, getRandomFood } from "@/app/food-actions";
import type { Food } from "@/app/actions";
import { Dices, LayoutDashboard, Loader2, UtensilsCrossed, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export default function CookPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  useEffect(() => {
    const loadFoods = async () => {
      try {
        const foodsData = await getFoods();
        setFoods(foodsData);
      } catch (error) {
        toast.error("Failed to load foods");
      } finally {
        setIsLoading(false);
      }
    };
    loadFoods();
  }, []);

  const handleSpin = () => {
    if (foods.length === 0) {
      toast.error("No foods available. Add some foods first!");
      return;
    }
    setIsSpinning(true);
  };

  const handleSpinComplete = useCallback(async (food: Food) => {
    setIsSpinning(false);
    setSelectedFood(food);
    toast.success(`Your meal: ${food.name}!`);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Random Food</h1>
            </div>
          </div>
          <Link href="/manage">
            <Button variant="outline" size="sm" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            What should I eat?
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Can't decide what to eat? Let fate decide for you!
          </p>

          <div className="flex justify-center mb-8">
            <FoodSpinner
              foods={foods}
              isSpinning={isSpinning}
              onSpinComplete={handleSpinComplete}
            />
          </div>

          <Button
            size="lg"
            onClick={handleSpin}
            disabled={isSpinning || foods.length === 0}
            className="gap-2 text-lg px-8 py-6"
          >
            {isSpinning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Spinning...
              </>
            ) : (
              <>
                <Dices className="w-5 h-5" />
                Pick Random Food
              </>
            )}
          </Button>

          {foods.length === 0 && (
            <p className="mt-4 text-muted-foreground">
              No foods in database.{" "}
              <Link href="/manage" className="text-primary hover:underline">
                Add some foods
              </Link>{" "}
              to get started!
            </p>
          )}

          <p className="mt-8 text-sm text-muted-foreground">
            {foods.length} food{foods.length !== 1 ? "s" : ""} in the database
          </p>
        </div>
      </main>
    </div>
  );
}