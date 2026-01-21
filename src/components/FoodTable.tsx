import type { Food } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, UtensilsCrossed } from "lucide-react";

interface FoodTableProps {
  foods: Food[];
  onEdit: (food: Food) => void;
}

export const FoodTable = ({ foods, onEdit }: FoodTableProps) => {
  if (foods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <UtensilsCrossed className="w-12 h-12 mb-4 opacity-50" />
        <p>No foods added yet. Add your first food!</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {foods.map((food) => (
            <TableRow key={food.id}>
              <TableCell>
                <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                  {food.image_url ? (
                    <img
                      src={food.image_url}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{food.name}</TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs truncate">
                {food.description || "-"}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{food.category}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(food)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <button disabled className="text-gray-400">Delete</button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
