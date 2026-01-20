'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServerAuthSession } from '@/lib/auth'

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

export async function getFoods(): Promise<Food[]> {
  try {
    const foods = await prisma.food.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })
    return foods.map(food => ({
      ...food,
      created_at: food.created_at.toISOString(),
      updated_at: food.updated_at.toISOString()
    }))
  } catch (error) {
    console.error('Failed to get foods:', error)
    throw new Error('Failed to get foods')
  }
}

export async function getRandomFood(): Promise<Food | null> {
  try {
    const foods = await prisma.food.findMany()
    if (!foods || foods.length === 0) return null

    const randomIndex = Math.floor(Math.random() * foods.length)
    const food = foods[randomIndex]
    return {
      ...food,
      created_at: food.created_at.toISOString(),
      updated_at: food.updated_at.toISOString()
    }
  } catch (error) {
    console.error('Failed to get random food:', error)
    throw new Error('Failed to get random food')
  }
}

export async function addFood(data: FoodInsert): Promise<Food> {
  const session = await getServerAuthSession()
  if (!session) {
    throw new Error('Unauthorized')
  }

  try {
    const food = await prisma.food.create({
      data
    })
    revalidatePath('/')
    revalidatePath('/manage')
    return {
      ...food,
      created_at: food.created_at.toISOString(),
      updated_at: food.updated_at.toISOString()
    }
  } catch (error) {
    console.error('Failed to add food:', error)
    throw new Error('Failed to add food')
  }
}

export async function updateFood(id: string, data: FoodUpdate): Promise<Food> {
  const session = await getServerAuthSession()
  if (!session) {
    throw new Error('Unauthorized')
  }

  try {
    const food = await prisma.food.update({
      where: { id },
      data
    })
    revalidatePath('/')
    revalidatePath('/manage')
    return {
      ...food,
      created_at: food.created_at.toISOString(),
      updated_at: food.updated_at.toISOString()
    }
  } catch (error) {
    console.error('Failed to update food:', error)
    throw new Error('Failed to update food')
  }
}

export async function deleteFood(id: string): Promise<void> {
  const session = await getServerAuthSession()
  if (!session) {
    throw new Error('Unauthorized')
  }

  try {
    await prisma.food.delete({
      where: { id }
    })
    revalidatePath('/')
    revalidatePath('/manage')
  } catch (error) {
    console.error('Failed to delete food:', error)
    throw new Error('Failed to delete food')
  }
}

export async function getRandomActivity(): Promise<Activity | null> {
  try {
    const activities = await prisma.activity.findMany()
    if (!activities || activities.length === 0) return null

    const randomIndex = Math.floor(Math.random() * activities.length)
    return activities[randomIndex]
  } catch (error) {
    console.error('Failed to get random activity:', error)
    throw new Error('Failed to get random activity')
  }
}

export async function addActivity(data: ActivityInsert): Promise<Activity> {
  try {
    const activity = await prisma.activity.create({
      data
    })
    revalidatePath('/')
    revalidatePath('/date')
    return activity
  } catch (error) {
    console.error('Failed to add activity:', error)
    throw new Error('Failed to add activity')
  }
}

export async function deleteActivity(id: number): Promise<void> {
  try {
    await prisma.activity.delete({
      where: { id }
    })
    revalidatePath('/')
    revalidatePath('/date')
  } catch (error) {
    console.error('Failed to delete activity:', error)
    throw new Error('Failed to delete activity')
  }
}