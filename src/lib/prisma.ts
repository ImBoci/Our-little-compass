import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const makePrismaClient = () => {
  // 1. Setup Variables
  let url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // 2. Protocol Check (LibSQL works best with https://)
  if (url?.startsWith("libsql://")) {
    url = url.replace("libsql://", "https://");
  }

  const isTurso = url?.startsWith("https://") && url.includes("turso.io");

  if (isTurso) {
    try {
      console.log("🔌 Connecting to Turso...");

      const tursoClient = createClient({
        url: url!,
        authToken: authToken,
      });

      // Try initializing WITHOUT 'as any' casting first.
      // If versions are synced, this should work.
      const adapter = new PrismaLibSQL(tursoClient);
      return new PrismaClient({ adapter });

    } catch (error) {
      const e = error as Error;
      console.error("❌ Turso Init Failed:", e);

      (globalThis as any)._prismaInitError = {
        name: e.name,
        message: e.message,
        stack: e.stack
      };
    }
  }

  // 3. Fallback
  console.log("⚠️ Using Local Fallback");
  return new PrismaClient({
    datasources: { db: { url: "file:./dev.db" } }
  });
}

export const prisma = globalForPrisma.prisma || makePrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma