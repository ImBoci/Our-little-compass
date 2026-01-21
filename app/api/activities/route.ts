import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({ orderBy: { id: 'desc' } });
    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json([], { status: 200 }); // Return empty on error to prevent build crash
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

    // Convert to number and validate
    const numId = Number(id);
    if (isNaN(numId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await prisma.activity.delete({ where: { id: numId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}