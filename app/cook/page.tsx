'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dices, LayoutDashboard, Loader2, UtensilsCrossed, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Food {
  id: string
  name: string
  description: string | null
  category: string
  created_at: string
  updated_at: string
}

export default function CookPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [randomFood, setRandomFood] = useState<Food | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

  // Load foods on component mount
  useEffect(() => {
    const loadFoods = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/food');
        if (response.ok) {
          const foodsData = await response.json();
          setFoods(foodsData);
          // Pick initial random food
          if (foodsData.length > 0) {
            const randomIndex = Math.floor(Math.random() * foodsData.length);
            setRandomFood(foodsData[randomIndex]);
          }
        } else {
          toast.error("Failed to load foods");
        }
      } catch (error) {
        console.error('Failed to load foods:', error);
        toast.error("Failed to load foods");
      } finally {
        setIsLoading(false);
      }
    };
    loadFoods();
  }, []);

  const pickRandomFood = () => {
    if (foods.length === 0) {
      toast.error("No foods available. Add some foods first!");
      return;
    }

    setIsSpinning(true);

    // Simulate spinning animation
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * foods.length);
      const selectedFood = foods[randomIndex];
      setRandomFood(selectedFood);
      setIsSpinning(false);
      toast.success(`Your meal: ${selectedFood.name}!`);
    }, 1500);
  };

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

          {/* Food Display */}
          {randomFood && (
            <Card className="mb-8 mx-auto max-w-md bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{randomFood.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {randomFood.category}
                </Badge>
                {randomFood.description && (
                  <p className="text-base text-muted-foreground">
                    {randomFood.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Button
            size="lg"
            onClick={pickRandomFood}
            disabled={isSpinning || foods.length === 0}
            className="gap-2 text-lg px-8 py-6 mb-8"
          >
            {isSpinning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Picking your meal...
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