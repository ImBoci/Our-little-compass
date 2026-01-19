import { Food } from "@/hooks/useFoods";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed } from "lucide-react";

interface FoodCardProps {
  food: Food;
  isAnimating?: boolean;
}

export const FoodCard = ({ food, isAnimating = false }: FoodCardProps) => {
  return (
    <Card 
      className={`w-full max-w-md overflow-hidden transition-all duration-300 ${
        isAnimating ? "animate-pulse scale-105" : ""
      }`}
    >
      <div className="h-48 bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
        {food.image_url ? (
          <img 
            src={food.image_url} 
            alt={food.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <UtensilsCrossed className="w-16 h-16 text-primary/50" />
        )}
      </div>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-2xl font-bold text-foreground">{food.name}</h3>
          <Badge variant="secondary" className="shrink-0">
            {food.category}
          </Badge>
        </div>
        {food.description && (
          <p className="text-muted-foreground">{food.description}</p>
        )}
      </CardContent>
    </Card>
  );
};
