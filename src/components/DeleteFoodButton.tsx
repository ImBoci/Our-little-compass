import { deleteFood } from "@/app/delete-actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteFoodButtonProps {
  foodId: string;
}

export function DeleteFoodButton({ foodId }: DeleteFoodButtonProps) {
  return (
    <form action={deleteFood} className="inline">
      <input type="hidden" name="id" value={foodId} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  );
}