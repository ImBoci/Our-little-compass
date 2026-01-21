import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client/web'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const makePrismaClient = () => {
  let url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // FIX: The web client works best with https://
  if (url?.startsWith("libsql://")) {
    url = url.replace("libsql://", "https://");
  }

  const isTurso = url?.startsWith("https://") && url.includes("turso.io");

  if (isTurso) {
    try {
      console.log("🔌 Connecting to Turso via HTTPS...");
      const tursoClient = createClient({
        url: url!,
        authToken: authToken,
      });
      const adapter = new PrismaLibSql(tursoClient as any);
      return new PrismaClient({ adapter: adapter as any });
    } catch (error) {
      const err = error as Error;
      console.error("❌ Turso Adapter Failed:", err);
      // Capture error for the debug page
      (globalThis as any)._prismaInitError = {
          message: err.message,
          stack: err.stack
      };
      // Fall through to fallback
    }
  }

  // Fallback
  console.log("⚠️ Using Local Fallback");
  return new PrismaClient({
    datasources: { db: { url: "file:./dev.db" } }
  });
}

export const prisma = globalForPrisma.prisma || makePrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma