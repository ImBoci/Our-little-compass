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
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupleId = (session.user as any).coupleId;

    const foods = await prisma.food.findMany({
      where: { coupleId },
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
    if (!session || !(session.user as any)?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const coupleId = (session.user as any).coupleId;

    const body = await request.json();
    const { name, description, category = "Other", image_url } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required and must be a string" }, { status: 400 });
    }

    const food = await prisma.food.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        category: typeof category === "string" ? category.trim() || "Other" : "Other",
        image_url: typeof image_url === "string" ? image_url.trim() || null : null,
        coupleId,
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
    if (!session || !(session.user as any)?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const coupleId = (session.user as any).coupleId;

    const body = await request.json();
    const { id, name, description, category, image_url } = body;
    const normalizedId = normalizeFoodId(id);

    if (!normalizedId) {
      return NextResponse.json({ error: "Food ID is required" }, { status: 400 });
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required and must be a string" }, { status: 400 });
    }

    const food = await prisma.food.updateMany({
      where: { id: normalizedId, coupleId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        category: typeof category === "string" ? category.trim() || "Other" : "Other",
        image_url: typeof image_url === "string" ? image_url.trim() || null : null,
      },
    });

    if (food.count === 0) return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update food:", error);
    return NextResponse.json({ error: "Failed to update food" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const coupleId = (session.user as any).coupleId;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Food ID is required" }, { status: 400 });
    }

    const result = await prisma.food.deleteMany({
      where: { id, coupleId },
    });

    if (result.count === 0) return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete food:", error);
    return NextResponse.json({ error: "Failed to delete food" }, { status: 500 });
  }
}