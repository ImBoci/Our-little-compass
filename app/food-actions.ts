'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerAuthSession } from '@/lib/auth'
import type { Food, FoodInsert, FoodUpdate } from './actions'

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