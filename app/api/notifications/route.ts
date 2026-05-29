import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const coupleId = (session.user as any).coupleId;

    const notifications = await prisma.appNotification.findMany({
      where: { coupleId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json([]);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const coupleId = (session.user as any).coupleId;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required." }, { status: 400 });
    }

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid notification ID." }, { status: 400 });
    }

    const result = await prisma.appNotification.deleteMany({ where: { id: numericId, coupleId } });
    if (result.count === 0) return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return NextResponse.json({ error: "Failed to delete notification." }, { status: 500 });
  }
}
