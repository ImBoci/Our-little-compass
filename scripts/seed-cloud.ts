import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function seedCloudDatabase() {
  try {
    console.log('☁️ Seeding cloud database...')

    // Read backup files
    const foodsPath = path.join(process.cwd(), 'backup_foods.json')
    const activitiesPath = path.join(process.cwd(), 'backup_activities.json')

    if (!fs.existsSync(foodsPath) || !fs.existsSync(activitiesPath)) {
      throw new Error('Backup files not found. Please run export script first.')
    }

    const foods = JSON.parse(fs.readFileSync(foodsPath, 'utf-8'))
    const activities = JSON.parse(fs.readFileSync(activitiesPath, 'utf-8'))

    console.log(`📥 Importing ${foods.length} foods...`)
    console.log(`📥 Importing ${activities.length} activities...`)

    // Create upsert promises for foods
    console.log('🍽️ Preparing food upsert operations...')
    const foodUpserts = foods.map((food) =>
      prisma.food.upsert({
        where: { id: food.id },
        update: {}, // Do nothing if exists
        create: {
          id: food.id,
          name: food.name,
          description: food.description || null,
          category: food.category,
          image_url: food.image_url || null,
          created_at: new Date(food.created_at),
          updated_at: new Date(food.updated_at)
        }
      })
    )

    // Create upsert promises for activities
    console.log('🎯 Preparing activity upsert operations...')
    const activityUpserts = activities.map((activity) =>
      prisma.activity.upsert({
        where: { id: activity.id },
        update: {}, // Do nothing if exists
        create: {
          id: activity.id,
          name: activity.name,
          location: activity.location || null,
          type: activity.type || null,
          description: activity.description || null
        }
      })
    )

    // Execute all upserts in a transaction
    console.log('⚡ Executing upsert operations in transaction...')
    const allOperations = [...foodUpserts, ...activityUpserts]

    await prisma.$transaction(allOperations)

    console.log(`✅ Successfully migrated ${foods.length} foods and ${activities.length} activities`)

    console.log('🎉 Cloud seeding complete!')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
seedCloudDatabase()