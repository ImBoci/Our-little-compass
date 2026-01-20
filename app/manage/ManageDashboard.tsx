'use client'

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FoodTable } from "@/components/FoodTable";
import { FoodForm } from "@/components/FoodForm";
import {
  addFood,
  updateFood,
  deleteFood,
  getFoods,
  Food,
  FoodInsert,
} from "@/app/actions";
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
import { ArrowLeft, Loader2, Plus, UtensilsCrossed, LogOut } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

interface ManageDashboardProps {
  initialFoods: Food[]
}

export function ManageDashboard({ initialFoods }: ManageDashboardProps) {
  const [foods, setFoods] = useState<Food[]>(initialFoods);

  const [formOpen, setFormOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [deletingFood, setDeletingFood] = useState<Food | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        await updateFood(editingFood.id, foodData);
        toast.success("Food updated successfully!");
        // Refresh foods
        const updatedFoods = await getFoods();
        setFoods(updatedFoods);
      } else {
        await addFood(foodData);
        toast.success("Food added successfully!");
        // Refresh foods
        const updatedFoods = await getFoods();
        setFoods(updatedFoods);
      }
      setFormOpen(false);
      setEditingFood(null);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deletingFood) return;
    setIsDeleting(true);
    try {
      await deleteFood(deletingFood.id);
      toast.success("Food deleted successfully!");
      // Refresh foods
      const updatedFoods = await getFoods();
      setFoods(updatedFoods);
      setDeletingFood(null);
    } catch (err) {
      toast.error("Failed to delete food. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Food Dashboard</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Food
            </Button>
            <Button
              onClick={() => signOut({ callbackUrl: '/' })}
              variant="outline"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">
            All Foods ({foods.length})
          </h2>
        </div>
        <FoodTable
          foods={foods}
          onEdit={handleEdit}
          onDelete={setDeletingFood}
          isDeleting={isDeleting}
        />
      </main>

      {/* Form Dialog */}
      <FoodForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        editingFood={editingFood}
        isLoading={false}
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
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}