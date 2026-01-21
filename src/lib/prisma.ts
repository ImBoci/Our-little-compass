import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const makePrismaClient = () => {
  // 1. Check which URL we have
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log("🔌 Initializing Prisma Client...")
  console.log("Database URL:", url ? (url.startsWith("libsql://") ? "LibSQL URL" : "Other URL") : "None")
  console.log("Auth Token:", authToken ? "Present" : "Missing")

  // 2. Is it a Turso/LibSQL URL?
  const isLibSQL = url?.startsWith("libsql://");

  if (isLibSQL) {
    console.log("✅ Detected LibSQL URL. Using Turso Adapter.");
    const tursoClient = createClient({
      url: url!,
      authToken: authToken,
    });
    const adapter = new PrismaLibSql(tursoClient as any);
    return new PrismaClient({ adapter: adapter as any });
  } else {
    // 3. Fallback to Local File
    console.log("⚠️ No LibSQL URL found. Using standard SQLite file.");
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma || makePrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma