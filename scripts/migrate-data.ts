import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function migrateDataToTurso() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoAuthToken) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables are required. Please add them to your .env file.')
  }

  console.log('🔄 Starting data migration from local SQLite to Turso...')

  // Initialize connections
  const prisma = new PrismaClient()
  const turso = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  })

  try {
    // Step 1: Fetch local data
    console.log('📥 Fetching data from local database...')

    const foods = await prisma.food.findMany({
      orderBy: { created_at: 'desc' }
    })

    const activities = await prisma.activity.findMany({
      orderBy: { id: 'asc' }
    })

    console.log(`📋 Found ${foods.length} foods and ${activities.length} activities to migrate`)

    // Step 2: Insert foods into Turso
    console.log('🍽️ Migrating foods to Turso...')
    let foodCount = 0

    for (const food of foods) {
      try {
        await turso.execute({
          sql: `INSERT INTO Food (id, name, description, category, image_url, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO NOTHING`,
          args: [
            food.id,
            food.name,
            food.description || null,
            food.category,
            food.image_url || null,
            food.created_at.toISOString(),
            food.updated_at.toISOString()
          ]
        })
        foodCount++
        if (foodCount % 10 === 0) {
          console.log(`✅ Migrated ${foodCount}/${foods.length} foods`)
        }
      } catch (error) {
        console.error(`❌ Failed to migrate food "${food.name}":`, error)
      }
    }

    console.log(`✅ Successfully migrated ${foodCount} foods`)

    // Step 3: Insert activities into Turso
    console.log('🎯 Migrating activities to Turso...')
    let activityCount = 0

    for (const activity of activities) {
      try {
        await turso.execute({
          sql: `INSERT INTO Activity (id, name, location, type, description)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(id) DO NOTHING`,
          args: [
            activity.id,
            activity.name,
            activity.location || null,
            activity.type || null,
            activity.description || null
          ]
        })
        activityCount++
        if (activityCount % 10 === 0) {
          console.log(`✅ Migrated ${activityCount}/${activities.length} activities`)
        }
      } catch (error) {
        console.error(`❌ Failed to migrate activity "${activity.name}":`, error)
      }
    }

    console.log(`✅ Successfully migrated ${activityCount} activities`)
    console.log('🎉 Data migration completed successfully!')

    // Step 4: Verification (optional)
    console.log('🔍 Verifying migration...')
    const foodResult = await turso.execute('SELECT COUNT(*) as count FROM Food')
    const activityResult = await turso.execute('SELECT COUNT(*) as count FROM Activity')

    const foodCountRemote = foodResult.rows[0]?.count || 0
    const activityCountRemote = activityResult.rows[0]?.count || 0

    console.log(`📊 Turso database now contains:`)
    console.log(`   - ${foodCountRemote} foods`)
    console.log(`   - ${activityCountRemote} activities`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    // Step 5: Cleanup
    console.log('🧹 Cleaning up connections...')
    await prisma.$disconnect()
    // Turso client doesn't need explicit closing
  }
}

// Run the migration
migrateDataToTurso()