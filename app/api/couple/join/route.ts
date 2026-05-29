import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inviteCode } = await req.json();

    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code is required." }, { status: 400 });
    }

    // Check if user already has a space
    const dbUser = await prisma.user.findUnique({
      where: { id: (session.user as any).id }
    });

    if (dbUser?.coupleId) {
      return NextResponse.json({ error: "You are already part of a space." }, { status: 400 });
    }

    // Find the couple by invite code
    const couple = await prisma.couple.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
      include: { users: true }
    });

    if (!couple) {
      return NextResponse.json({ error: "Invalid invite code." }, { status: 404 });
    }

    if (couple.users.length >= 2) {
      return NextResponse.json({ error: "This space is already full (max 2 members)." }, { status: 400 });
    }

    // Attach user to couple
    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { coupleId: couple.id }
    });

    return NextResponse.json({ success: true, coupleId: couple.id });
  } catch (error) {
    console.error("Join couple error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
