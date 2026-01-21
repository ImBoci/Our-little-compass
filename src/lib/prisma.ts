import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const makePrismaClient = () => {
  // During Next.js build time, use standard PrismaClient to avoid .bind errors
  if (typeof window === 'undefined' && process.env.npm_lifecycle_event === 'build') {
    console.log("🔌 Build time detected (npm build). Using standard PrismaClient.");
    return new PrismaClient();
  }

  // 1. Get the URL from EITHER variable
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // 2. Debug Log (Visible in Vercel Logs)
  console.log("🔌 DB Init - URL found:", url ? "Yes" : "No");
  console.log("🔌 DB Init - Protocol:", url?.split(':')[0]);

  // 3. Check if it is a Turso/LibSQL URL
  const isLibSQL = url?.startsWith("libsql://") || url?.startsWith("https://");

  if (isLibSQL) {
    console.log("✅ Using Turso (LibSQL) Adapter");
    const tursoClient = createClient({
      url: url!,
      authToken: authToken,
    });
    const adapter = new PrismaLibSql(tursoClient as any);
    return new PrismaClient({ adapter: adapter as any });
  } else {
    console.log("⚠️ Using Local SQLite Fallback (Expect empty data on Vercel)");
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma || makePrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma