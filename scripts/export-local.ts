import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function exportLocalData() {
  try {
    console.log('📤 Exporting local data...')

    // Fetch all foods
    const foods = await prisma.food.findMany({
      orderBy: { created_at: 'desc' }
    })
    console.log(`📋 Found ${foods.length} foods`)

    // Fetch all activities
    const activities = await prisma.activity.findMany({
      orderBy: { id: 'asc' }
    })
    console.log(`📋 Found ${activities.length} activities`)

    // Write to JSON files
    const foodsPath = path.join(process.cwd(), 'backup_foods.json')
    const activitiesPath = path.join(process.cwd(), 'backup_activities.json')

    fs.writeFileSync(foodsPath, JSON.stringify(foods, null, 2))
    fs.writeFileSync(activitiesPath, JSON.stringify(activities, null, 2))

    console.log('✅ Export complete!')
    console.log(`📁 Foods saved to: ${foodsPath}`)
    console.log(`📁 Activities saved to: ${activitiesPath}`)

  } catch (error) {
    console.error('❌ Export failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the export
exportLocalData()