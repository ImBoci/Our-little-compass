import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FoodSpinner } from "@/components/FoodSpinner";
import { useFoods, Food } from "@/hooks/useFoods";
import { Dices, LayoutDashboard, Loader2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { data: foods = [], isLoading, error } = useFoods();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const handleSpin = () => {
    if (foods.length === 0) {
      toast.error("No foods available. Add some foods first!");
      return;
    }
    setIsSpinning(true);
  };

  const handleSpinComplete = useCallback((food: Food) => {
    setIsSpinning(false);
    setSelectedFood(food);
    toast.success(`Your meal: ${food.name}!`);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load foods</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Random Food</h1>
          </div>
          <Link to="/dashboard">
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

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
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
                  <Link to="/dashboard" className="text-primary hover:underline">
                    Add some foods
                  </Link>{" "}
                  to get started!
                </p>
              )}

              <p className="mt-8 text-sm text-muted-foreground">
                {foods.length} food{foods.length !== 1 ? "s" : ""} in the database
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
