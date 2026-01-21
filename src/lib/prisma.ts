import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const makePrismaClient = () => {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Check if it is a LibSQL URL (Turso)
  const isLibSQL = url?.startsWith("libsql://") || url?.startsWith("https://");

  if (isLibSQL) {
    try {
      console.log("🔌 Connecting to Turso...");
      const tursoClient = createClient({
        url: url!,
        authToken: authToken,
      });
      const adapter = new PrismaLibSql(tursoClient);
      return new PrismaClient({ adapter });
    } catch (error) {
      console.error("❌ Turso Init Failed:", error);
      (globalThis as any)._prismaInitError = error;
    }
  }

  // Fallback
  console.log("⚠️ Using Local Fallback");
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma || makePrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma