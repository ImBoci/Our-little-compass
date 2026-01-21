import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({ orderBy: { id: 'desc' } });
    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await prisma.activity.create({
      data: {
        name: body.name,
        description: body.description,
        location: body.location,
        type: body.type,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID missing" }, { status: 400 });

    // Handle both number and string IDs safely
    const numId = Number(id);
    if (!isNaN(numId)) {
      await prisma.activity.delete({ where: { id: numId } });
    } else {
      await prisma.activity.delete({ where: { id: id } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}