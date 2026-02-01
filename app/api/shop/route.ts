import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.shoppingItem.findMany({
      orderBy: [{ checked: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to fetch shopping items:", error);
    return NextResponse.json([], {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, names, user } = body || {};

    const items: string[] = Array.isArray(names)
      ? names
      : typeof name === "string"
        ? [name]
        : [];

    const cleaned = items.map((item) => item.trim()).filter((item) => item.length > 0);
    if (cleaned.length === 0) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const resolvedUser =
      typeof user === "string" && user.trim().length > 0 ? user.trim() : "Anonymous";

    try {
      const createdItems = await prisma.$transaction(
        cleaned.map((item) =>
          prisma.shoppingItem.create({
            data: { name: item, user: resolvedUser },
          })
        )
      );

      return NextResponse.json(createdItems);
    } catch (createError) {
      console.error("Failed to create shopping items (db):", createError);
      return NextResponse.json({ error: "Failed to create shopping items." }, { status: 500 });
    }
  } catch (error) {
    console.error("Failed to create shopping items:", error);
    return NextResponse.json({ error: "Failed to create shopping items." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, checked } = body || {};

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid item ID." }, { status: 400 });
    }
    if (typeof checked !== "boolean") {
      return NextResponse.json({ error: "Checked must be boolean." }, { status: 400 });
    }

    const updated = await prisma.shoppingItem.update({
      where: { id: numericId },
      data: { checked },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update shopping item:", error);
    return NextResponse.json({ error: "Failed to update shopping item." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (action === "clear_completed") {
      await prisma.shoppingItem.deleteMany({ where: { checked: true } });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "Item ID is required." }, { status: 400 });
    }

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid item ID." }, { status: 400 });
    }

    await prisma.shoppingItem.delete({ where: { id: numericId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete shopping item(s):", error);
    return NextResponse.json({ error: "Failed to delete shopping item(s)." }, { status: 500 });
  }
}
