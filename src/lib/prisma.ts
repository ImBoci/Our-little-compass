import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const makePrismaClient = () => {
  // 1. Setup Variables
  // We prioritize TURSO_ vars, but check DATABASE_URL too
  let url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // 2. Protocol Check (LibSQL works best with https:// for the HTTP client)
  if (url?.startsWith("libsql://")) {
    url = url.replace("libsql://", "https://");
  }

  const isTurso = url?.startsWith("https://") && url.includes("turso.io");

  if (isTurso) {
    try {
      console.log("🔌 Attempting Turso Connection...");

      const tursoClient = createClient({
        url: url!,
        authToken: authToken,
      });

      const adapter = new PrismaLibSql(tursoClient as any);
      return new PrismaClient({ adapter: adapter as any });

    } catch (error) {
      const e = error as Error;
      console.error("❌ Turso Init Failed:", e);

      // Save the error text globally so the Debug Route can see it
      (globalThis as any)._prismaInitError = {
        name: e.name,
        message: e.message,
        stack: e.stack
      };
    }
  }

  // 3. Fallback (Build-Safe)
  // We Explicitly set the URL to a dummy file to bypass the "must start with file:" error
  console.log("⚠️ Using Local Fallback (Standard Client)");
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