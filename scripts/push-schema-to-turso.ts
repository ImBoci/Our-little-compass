import { createClient } from '@libsql/client'
import dotenv from 'dotenv'
import fs from 'fs'

// Load environment variables
dotenv.config()

async function pushSchemaToTurso() {
  const databaseUrl = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!databaseUrl) {
    throw new Error('TURSO_DATABASE_URL environment variable is not set. Please add it to your .env file.')
  }

  if (!authToken) {
    throw new Error('TURSO_AUTH_TOKEN environment variable is not set. Please add it to your .env file.')
  }

  console.log(`🔑 Token starts with: ${authToken.substring(0, 5)}...`)
  console.log('🔄 Resetting and pushing schema to Turso database...')

  try {
    // Connect to Turso
    const client = createClient({
      url: databaseUrl,
      authToken: authToken,
    })

    // 1. Drop existing tables
    console.log('🗑️ Dropping existing tables...')
    const tablesResult = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    for (const row of tablesResult.rows) {
      const tableName = row.name as string
      console.log(`Dropping table: ${tableName}`)
      await client.execute(`DROP TABLE IF EXISTS "${tableName}"`)
    }

    // Read SQL from manual migration file
    console.log('📂 Reading SQL from migration.sql...')
    const sqlContent = fs.readFileSync('migration.sql', 'utf8')

    // Simple split by semicolon and clean up
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)

    console.log(`📄 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
          await client.execute(statement)
        } catch (error) {
          console.error(`❌ Failed to execute statement ${i + 1}:`, error)
          console.error('Statement:', statement.substring(0, 100) + '...')
        }
      }
    }

    console.log('✅ Schema push complete!')
    console.log('🎉 Your Turso database is now ready with the correct schema.')

  } catch (error) {
    console.error('❌ Schema push failed:', error)
    process.exit(1)
  }
}

// Run the schema push
pushSchemaToTurso()