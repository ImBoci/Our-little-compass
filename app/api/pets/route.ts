import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupleId = (session.user as any).coupleId;
    const { name, type, startDate } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const parsedDate = startDate ? new Date(startDate) : new Date();
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
    }

    const pet = await prisma.pet.create({
      data: {
        name: name.trim(),
        type: typeof type === "string" ? type.trim() || null : null,
        startDate: parsedDate,
        coupleId
      }
    });

    return NextResponse.json(pet, { status: 201 });
  } catch (error) {
    console.error("Create pet error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupleId = (session.user as any).coupleId;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Pet ID is required" }, { status: 400 });
    }

    const result = await prisma.pet.deleteMany({
      where: { id, coupleId }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete pet error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
