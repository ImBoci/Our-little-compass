import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = {
    tursoUrlExists: !!process.env.TURSO_DATABASE_URL,
    tursoTokenExists: !!process.env.TURSO_AUTH_TOKEN,
    databaseUrlExists: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    connectionTest: "Pending",
    error: null as any,
    counts: { foods: -1 }
  };

  try {
    const count = await prisma.food.count();
    report.counts.foods = count;
    report.connectionTest = "Success";
  } catch (e: any) {
    report.connectionTest = "Failed";
    report.error = e.message;
    console.error("Debug Route Error:", e);
  }

  return NextResponse.json(report, { status: 200 });
}