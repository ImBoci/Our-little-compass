import { useState, useEffect } from "react";
import { Food, FoodInsert } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CATEGORIES = [
  "Italian",
  "Japanese",
  "Mexican",
  "Thai",
  "American",
  "Indian",
  "French",
  "Vietnamese",
  "British",
  "Middle Eastern",
  "Chinese",
  "Korean",
  "Greek",
  "Spanish",
  "Other",
];

interface FoodFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (food: FoodInsert) => void;
  editingFood?: Food | null;
  isLoading?: boolean;
}

export const FoodForm = ({
  open,
  onOpenChange,
  onSubmit,
  editingFood,
  isLoading,
}: FoodFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (editingFood) {
      setName(editingFood.name);
      setDescription(editingFood.description || "");
      setCategory(editingFood.category);
      setImageUrl(editingFood.image_url || "");
    } else {
      setName("");
      setDescription("");
      setCategory("Other");
      setImageUrl("");
    }
  }, [editingFood, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      category,
      image_url: imageUrl.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingFood ? "Edit Food" : "Add New Food"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pizza Margherita"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the food..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? "Saving..." : editingFood ? "Update" : "Add Food"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
