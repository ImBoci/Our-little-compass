import { useState, useEffect } from "react";
import { Food } from "@/app/actions";
import { UtensilsCrossed } from "lucide-react";

interface FoodSpinnerProps {
  foods: Food[];
  isSpinning: boolean;
  onSpinComplete: (food: Food) => void;
}

export const FoodSpinner = ({ foods, isSpinning, onSpinComplete }: FoodSpinnerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayFood, setDisplayFood] = useState<Food | null>(null);

  useEffect(() => {
    if (!isSpinning || foods.length === 0) return;

    let iterations = 0;
    const maxIterations = 20;
    let delay = 50;

    const spin = () => {
      if (iterations >= maxIterations) {
        const finalIndex = Math.floor(Math.random() * foods.length);
        setDisplayFood(foods[finalIndex]);
        onSpinComplete(foods[finalIndex]);
        return;
      }

      const randomIndex = Math.floor(Math.random() * foods.length);
      setCurrentIndex(randomIndex);
      setDisplayFood(foods[randomIndex]);
      iterations++;
      delay += 15;

      setTimeout(spin, delay);
    };

    spin();
  }, [isSpinning, foods, onSpinComplete]);

  if (!displayFood && !isSpinning) {
    return (
      <div className="w-full max-w-md h-72 rounded-lg bg-card border border-border flex flex-col items-center justify-center gap-4">
        <UtensilsCrossed className="w-16 h-16 text-muted-foreground/50" />
        <p className="text-muted-foreground text-center px-4">
          Click the button below to get a random food suggestion!
        </p>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-md rounded-lg bg-card border border-border overflow-hidden transition-all duration-200 ${
        isSpinning ? "animate-pulse" : ""
      }`}
    >
      <div className="h-48 bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
        {displayFood?.image_url ? (
          <img
            src={displayFood.image_url}
            alt={displayFood.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <UtensilsCrossed className="w-16 h-16 text-primary/50" />
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-2xl font-bold text-foreground">
            {displayFood?.name || "???"}
          </h3>
          <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            {displayFood?.category || "???"}
          </span>
        </div>
        {displayFood?.description && (
          <p className="text-muted-foreground">{displayFood.description}</p>
        )}
      </div>
    </div>
  );
};