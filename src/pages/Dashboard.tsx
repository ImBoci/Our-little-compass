import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FoodTable } from "@/components/FoodTable";
import { FoodForm } from "@/components/FoodForm";
import {
  useFoods,
  useAddFood,
  useUpdateFood,
  useDeleteFood,
  Food,
  FoodInsert,
} from "@/hooks/useFoods";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Loader2, Plus, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { data: foods = [], isLoading, error } = useFoods();
  const addFood = useAddFood();
  const updateFood = useUpdateFood();
  const deleteFood = useDeleteFood();

  const [formOpen, setFormOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [deletingFood, setDeletingFood] = useState<Food | null>(null);

  const handleAdd = () => {
    setEditingFood(null);
    setFormOpen(true);
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setFormOpen(true);
  };

  const handleSubmit = async (foodData: FoodInsert) => {
    try {
      if (editingFood) {
        await updateFood.mutateAsync({ id: editingFood.id, updates: foodData });
        toast.success("Food updated successfully!");
      } else {
        await addFood.mutateAsync(foodData);
        toast.success("Food added successfully!");
      }
      setFormOpen(false);
      setEditingFood(null);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deletingFood) return;
    try {
      await deleteFood.mutateAsync(deletingFood.id);
      toast.success("Food deleted successfully!");
      setDeletingFood(null);
    } catch (err) {
      toast.error("Failed to delete food. Please try again.");
    }
  };

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
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Food Dashboard</h1>
            </div>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Food
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">
                All Foods ({foods.length})
              </h2>
            </div>
            <FoodTable
              foods={foods}
              onEdit={handleEdit}
              onDelete={setDeletingFood}
              isDeleting={deleteFood.isPending}
            />
          </>
        )}
      </main>

      {/* Form Dialog */}
      <FoodForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        editingFood={editingFood}
        isLoading={addFood.isPending || updateFood.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingFood}
        onOpenChange={(open) => !open && setDeletingFood(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deletingFood?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this food
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteFood.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
