import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whitelist = await prisma.whitelistedEmail.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(whitelist);
  } catch (error) {
    console.error("GET whitelist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const lowercasedEmail = email.trim().toLowerCase();

    // Check if already exists
    const existing = await prisma.whitelistedEmail.findUnique({
      where: { email: lowercasedEmail },
    });
    if (existing) {
      return NextResponse.json({ error: "Email is already whitelisted" }, { status: 400 });
    }

    const created = await prisma.whitelistedEmail.create({
      data: { email: lowercasedEmail },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST whitelist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.whitelistedEmail.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE whitelist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
