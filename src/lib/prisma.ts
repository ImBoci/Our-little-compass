import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Check if we're using Turso (production) and have all required env vars
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

  if (tursoUrl && tursoAuthToken) {
    try {
      // Production: Use LibSQL adapter for Turso
      const tursoClient = createClient({
        url: tursoUrl,
        authToken: tursoAuthToken,
      })
      const adapter = new PrismaLibSql(tursoClient as any)
      return new PrismaClient({ adapter: adapter as any })
    } catch (error) {
      // Silently fall back to standard PrismaClient during build or when Turso is not available
      return new PrismaClient()
    }
  } else {
    // Local Development or Build Time: Use standard PrismaClient
    return new PrismaClient()
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma