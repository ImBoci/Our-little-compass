'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Activity, ActivityInsert } from './actions'

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