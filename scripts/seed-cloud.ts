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

    // Insert foods (using createMany for efficiency)
    if (foods.length > 0) {
      await prisma.food.createMany({
        data: foods.map((food: any) => ({
          name: food.name,
          description: food.description,
          category: food.category,
          image_url: food.image_url,
          created_at: new Date(food.created_at),
          updated_at: new Date(food.updated_at)
        })),
        skipDuplicates: true
      })
      console.log('✅ Foods imported successfully')
    }

    // Insert activities (using createMany for efficiency)
    if (activities.length > 0) {
      await prisma.activity.createMany({
        data: activities.map((activity: any) => ({
          name: activity.name,
          location: activity.location,
          type: activity.type,
          description: activity.description
        })),
        skipDuplicates: true
      })
      console.log('✅ Activities imported successfully')
    }

    console.log('🎉 Cloud seeding complete!')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
seedCloudDatabase()