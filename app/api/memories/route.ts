import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const memories = await prisma.memory.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(memories);
  } catch (error) {
    console.error("Failed to fetch memories:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, rating, note, date, user } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required and must be a string" }, { status: 400 });
    }

    if (!type || typeof type !== "string") {
      return NextResponse.json({ error: "Type is required and must be a string" }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
    }

    const parsedDate = date ? new Date(date) : new Date();
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Date must be a valid ISO date string" }, { status: 400 });
    }

    const memory = await prisma.memory.create({
      data: {
        name: name.trim(),
        type: type.trim(),
        rating: numericRating,
        note: typeof note === "string" ? note.trim() || null : null,
        date: parsedDate,
        user: typeof user === "string" ? user.trim() || null : null,
      },
    });

    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    console.error("Failed to create memory:", error);
    return NextResponse.json({ error: "Failed to create memory" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Memory ID is required" }, { status: 400 });
    }

    const numId = Number(id);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.memory.delete({ where: { id: numId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete memory:", error);
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}
