'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerAuthSession } from '@/lib/auth'

export async function deleteFood(formData: FormData): Promise<void> {
  const session = await getServerAuthSession()
  if (!session) {
    throw new Error('Unauthorized')
  }

  const id = formData.get('id') as string
  if (!id) {
    throw new Error('Food ID is required')
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

export async function deleteActivity(formData: FormData): Promise<void> {
  const id = formData.get('id') as string
  if (!id) {
    throw new Error('Activity ID is required')
  }

  try {
    await prisma.activity.delete({
      where: { id: parseInt(id) }
    })
    revalidatePath('/')
    revalidatePath('/date')
  } catch (error) {
    console.error('Failed to delete activity:', error)
    throw new Error('Failed to delete activity')
  }
}