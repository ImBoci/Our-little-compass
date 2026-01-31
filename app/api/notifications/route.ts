import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const notifications = await prisma.appNotification.findMany({
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required." }, { status: 400 });
    }

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid notification ID." }, { status: 400 });
    }

    await prisma.appNotification.delete({ where: { id: numericId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return NextResponse.json({ error: "Failed to delete notification." }, { status: 500 });
  }
}
