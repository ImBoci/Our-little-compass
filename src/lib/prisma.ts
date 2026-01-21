import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client/web'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const makePrismaClient = () => {
  // 1. Identify if we have Turso credentials
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Check if it looks like a LibSQL URL
  const isLibSQL = url?.startsWith("libsql://") || url?.startsWith("https://");

  if (isLibSQL) {
    try {
      console.log("🔌 Attempting to connect to Turso...");
      const tursoClient = createClient({
        url: url!,
        authToken: authToken,
      });

      // Cast to any to avoid TypeScript strictness issues during build
      const adapter = new PrismaLibSql(tursoClient as any);
      return new PrismaClient({ adapter: adapter as any });

    } catch (error) {
      console.error("⚠️ Turso Adapter failed to initialize (Expected during build):", error);
      // Capture error for debug visibility
      (globalThis as any)._prismaInitError = error;
      // FALL THROUGH to the fallback below
    }
  }

  // 2. FALLBACK: Standard SQLite (Build-Safe)
  // We explicitly set the URL to a local file to override the 'libsql://' env var
  // This prevents the "URL must start with file:" error during fallback.
  console.log("⚠️ Using Local SQLite Fallback.");
  return new PrismaClient({
    datasources: {
      db: {
        url: "file:./dev.db"
      }
    }
  });
}

export const prisma = globalForPrisma.prisma || makePrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma