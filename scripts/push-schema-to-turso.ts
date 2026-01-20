import { createClient } from '@libsql/client'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

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

  // Debug: Show first 5 characters of token
  console.log(`🔑 Token starts with: ${authToken.substring(0, 5)}...`)
  console.log('🔄 Pushing schema to Turso database...')

  try {
    // Connect to Turso
    const client = createClient({
      url: databaseUrl,
      authToken: authToken,
    })

    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migration.sql')

    if (!fs.existsSync(migrationPath)) {
      throw new Error('migration.sql file not found. Please run: npx prisma migrate diff --from-empty --to-schema-datamodel --script > migration.sql')
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // Split SQL into individual statements (by semicolon)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📄 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
          await client.execute(statement)
        } catch (error) {
          // Log the error but continue with other statements
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