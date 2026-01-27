import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const normalizeFoodId = (value: unknown) => {
  if (value === null || value === undefined) return null;
  const stringValue = String(value).trim();
  if (!stringValue) return null;
  return stringValue;
};

export async function GET() {
  try {
    const foods = await prisma.food.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(foods);
  } catch (error) {
    console.error("Failed to fetch foods:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category = "Other" } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required and must be a string" }, { status: 400 });
    }

    const food = await prisma.food.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        category: typeof category === "string" ? category.trim() || "Other" : "Other",
      },
    });

    return NextResponse.json(food, { status: 201 });
  } catch (error) {
    console.error("Failed to create food:", error);
    return NextResponse.json({ error: "Failed to create food" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, category } = body;
    const normalizedId = normalizeFoodId(id);

    if (!normalizedId) {
      return NextResponse.json({ error: "Food ID is required" }, { status: 400 });
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required and must be a string" }, { status: 400 });
    }

    const food = await prisma.food.update({
      where: { id: normalizedId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        category: typeof category === "string" ? category.trim() || "Other" : "Other",
      },
    });

    return NextResponse.json(food);
  } catch (error) {
    console.error("Failed to update food:", error);
    return NextResponse.json({ error: "Failed to update food" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Food ID is required" }, { status: 400 });
    }

    await prisma.food.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete food:", error);
    return NextResponse.json({ error: "Failed to delete food" }, { status: 500 });
  }
}