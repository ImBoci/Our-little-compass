import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.coupleId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const coupleId = (session.user as any).coupleId;

    const activities = await prisma.activity.findMany({ where: { coupleId }, orderBy: { id: "desc" } });
    return NextResponse.json(activities);
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.coupleId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const coupleId = (session.user as any).coupleId;

    const body = await request.json();
    const { name, description, location, type, image_url } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required and must be a string" }, { status: 400 });
    }

    const activity = await prisma.activity.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        type: type?.trim() || null,
        image_url: typeof image_url === "string" ? image_url.trim() || null : null,
        coupleId,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.coupleId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const coupleId = (session.user as any).coupleId;

    const body = await request.json();
    const { id, name, description, location, type, image_url } = body;

    const numId = Number(id);
    if (!id || Number.isNaN(numId)) {
      return NextResponse.json({ error: "Valid activity ID is required" }, { status: 400 });
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required and must be a string" }, { status: 400 });
    }

    const activity = await prisma.activity.updateMany({
      where: { id: numId, coupleId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        type: type?.trim() || null,
        image_url: typeof image_url === "string" ? image_url.trim() || null : null,
      },
    });
    
    if (activity.count === 0) return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update activity:", error);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.coupleId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const coupleId = (session.user as any).coupleId;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Activity ID is required" }, { status: 400 });
    }

    const numId = Number(id);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await prisma.activity.deleteMany({
      where: { id: numId, coupleId },
    });
    
    if (result.count === 0) return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete activity:", error);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}