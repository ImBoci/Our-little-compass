// Types and utility functions - no server actions here to avoid build issues
export interface Food {
  id: string
  name: string
  description: string | null
  category: string
  image_url: string | null
  created_at: string
  updated_at: string
}

export type FoodInsert = Omit<Food, 'id' | 'created_at' | 'updated_at'>
export type FoodUpdate = Partial<FoodInsert>

export interface Activity {
  id: number
  name: string
  location: string | null
  type: string | null
  description: string | null
}

export type ActivityInsert = Omit<Activity, 'id'>
