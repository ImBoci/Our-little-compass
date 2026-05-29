import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const coupleId = (session.user as any).coupleId;
    const couple = await prisma.couple.findUnique({
      where: { id: coupleId },
      include: { pets: true }
    });

    if (!couple) {
      return NextResponse.json({ error: "Couple not found" }, { status: 404 });
    }

    return NextResponse.json(couple);
  } catch (error) {
    console.error("Get couple error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    // Check if user already has a space
    const dbUser = await prisma.user.findUnique({
      where: { id: (session.user as any).id }
    });

    if (dbUser?.coupleId) {
      return NextResponse.json({ error: "You are already part of a space." }, { status: 400 });
    }

    // Generate a unique 6-character alphanumeric code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create the Couple and attach the user
    const couple = await prisma.couple.create({
      data: {
        name: name || "Our Space",
        inviteCode,
        users: {
          connect: { id: (session.user as any).id }
        }
      }
    });

    return NextResponse.json({ success: true, couple });
  } catch (error) {
    console.error("Create couple error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
