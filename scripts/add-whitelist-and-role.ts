import { createClient } from '@libsql/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function addWhitelistAndRole() {
  const databaseUrl = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!databaseUrl) {
    throw new Error('TURSO_DATABASE_URL environment variable is not set. Please uncomment it in your .env file.')
  }

  if (!authToken) {
    throw new Error('TURSO_AUTH_TOKEN environment variable is not set. Please uncomment it in your .env file.')
  }

  console.log('🔄 Adding missing columns and tables to Turso...')

  try {
    const client = createClient({
      url: databaseUrl,
      authToken: authToken,
    })

    // 1. Add "role" column to User table (if not already present)
    console.log('⚡ Adding "role" column to User table...')
    try {
      await client.execute(`ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER'`)
      console.log('  ✅ "role" column added.')
    } catch (error: any) {
      if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
        console.log('  ⏭️ "role" column already exists, skipping.')
      } else {
        console.error('  ❌ Failed to add "role" column:', error.message)
      }
    }

    // 2. Add "ownerId" column to Couple table (if not already present)
    console.log('⚡ Adding "ownerId" column to Couple table...')
    try {
      await client.execute(`ALTER TABLE "Couple" ADD COLUMN "ownerId" TEXT`)
      console.log('  ✅ "ownerId" column added.')
    } catch (error: any) {
      if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
        console.log('  ⏭️ "ownerId" column already exists, skipping.')
      } else {
        console.error('  ❌ Failed to add "ownerId" column:', error.message)
      }
    }

    // 3. Add "userId" column to PushSubscription table (if not already present)
    console.log('⚡ Adding "userId" column to PushSubscription table...')
    try {
      await client.execute(`ALTER TABLE "PushSubscription" ADD COLUMN "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE`)
      console.log('  ✅ "userId" column added.')
    } catch (error: any) {
      if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
        console.log('  ⏭️ "userId" column already exists, skipping.')
      } else {
        console.error('  ❌ Failed to add "userId" column:', error.message)
      }
    }

    // 4. Create WhitelistedEmail table (if not already present)
    console.log('⚡ Creating "WhitelistedEmail" table...')
    try {
      await client.execute(`
        CREATE TABLE "WhitelistedEmail" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log('  ✅ "WhitelistedEmail" table created.')
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('  ⏭️ "WhitelistedEmail" table already exists, skipping.')
      } else {
        console.error('  ❌ Failed to create "WhitelistedEmail" table:', error.message)
      }
    }

    // 5. Create unique index on WhitelistedEmail.email
    console.log('⚡ Creating unique index on WhitelistedEmail.email...')
    try {
      await client.execute(`CREATE UNIQUE INDEX "WhitelistedEmail_email_key" ON "WhitelistedEmail"("email")`)
      console.log('  ✅ Unique index created.')
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('  ⏭️ Index already exists, skipping.')
      } else {
        console.error('  ❌ Failed to create index:', error.message)
      }
    }

    // 6. Verify the schema
    console.log('\n📋 Verifying schema...')
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream%'")
    console.log('Tables:', tables.rows.map(r => r.name))

    const userCols = await client.execute("PRAGMA table_info('User')")
    console.log('\nUser columns:', userCols.rows.map(r => `${r.name} (${r.type})`))

    console.log('\n✅ All done! Your Turso database now has the WhitelistedEmail table and role column.')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

addWhitelistAndRole()
