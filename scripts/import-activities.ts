import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface ActivityData {
  name: string
  location: string
  type: string
  description?: string
}

async function importActivities() {
  try {
    // Read the activities.json file from the root directory
    const activitiesPath = path.join(process.cwd(), 'activities.json')
    const activitiesData = fs.readFileSync(activitiesPath, 'utf-8')
    const activities: ActivityData[] = JSON.parse(activitiesData)

    console.log(`Found ${activities.length} activities to import`)

    // Import each activity
    for (const activity of activities) {
      try {
        await prisma.activity.create({
          data: {
            name: activity.name,
            location: activity.location,
            type: activity.type,
            description: activity.description || null
          }
        })
        console.log(`✅ Imported: ${activity.name}`)
      } catch (error) {
        console.error(`❌ Failed to import ${activity.name}:`, error)
      }
    }

    console.log('🎉 Import completed!')
  } catch (error) {
    console.error('❌ Import failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the import
importActivities()