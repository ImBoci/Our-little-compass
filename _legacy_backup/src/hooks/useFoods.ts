import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Food {
  id: string;
  name: string;
  description: string | null;
  category: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type FoodInsert = Omit<Food, "id" | "created_at" | "updated_at">;
export type FoodUpdate = Partial<FoodInsert>;

export const useFoods = () => {
  return useQuery({
    queryKey: ["foods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Food[];
    },
  });
};

export const useRandomFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select("*");

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex] as Food;
    },
  });
};

export const useAddFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (food: FoodInsert) => {
      const { data, error } = await supabase
        .from("foods")
        .insert(food)
        .select()
        .single();

      if (error) throw error;
      return data as Food;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
  });
};

export const useUpdateFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: FoodUpdate }) => {
      const { data, error } = await supabase
        .from("foods")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Food;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
  });
};

export const useDeleteFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("foods")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
  });
};
