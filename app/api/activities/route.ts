import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({ orderBy: { id: 'desc' } });
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, location, type } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required and must be a string' }, { status: 400 });
    }

    const activity = await prisma.activity.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        type: type?.trim() || null,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Failed to create activity:', error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 });
    }

    // Safe ID conversion: try number first, fallback to string if needed
    let activityId: number | string;
    const numId = Number(id);
    if (!isNaN(numId)) {
      activityId = numId;
    } else {
      activityId = id; // fallback to string if conversion fails
    }

    await prisma.activity.delete({
      where: { id: activityId as number }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete activity:', error);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}