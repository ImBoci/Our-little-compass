import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import backupFoods from "@/../backup_foods.json";
import backupActivities from "@/../backup_activities.json";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const coupleId = (session.user as any).coupleId;
    const couple = await prisma.couple.findUnique({
      where: { id: coupleId },
      include: { pets: true }
    });

    if (!couple) {
      return NextResponse.json({ error: "Couple not found" }, { status: 404 });
    }

    return NextResponse.json(couple);
  } catch (error) {
    console.error("Get couple error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    // Check if user already has a space
    const dbUser = await prisma.user.findUnique({
      where: { id: (session.user as any).id }
    });

    if (dbUser?.coupleId) {
      return NextResponse.json({ error: "You are already part of a space." }, { status: 400 });
    }

    // Generate a unique 6-character alphanumeric code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create the Couple and attach the user
    const couple = await prisma.couple.create({
      data: {
        name: name || "Our Space",
        inviteCode,
        users: {
          connect: { id: (session.user as any).id }
        }
      }
    });

    // Populate with default backup catalog
    try {
      const foodData = backupFoods.map((f: any) => ({
        name: f.name,
        description: f.description,
        category: f.category,
        image_url: f.image_url,
        coupleId: couple.id,
      }));
      await prisma.food.createMany({ data: foodData });

      const activityData = backupActivities.map((a: any) => ({
        name: a.name,
        location: a.location,
        type: a.type,
        description: a.description,
        coupleId: couple.id,
      }));
      await prisma.activity.createMany({ data: activityData });
    } catch (err) {
      console.error("Failed to seed default catalog for new couple:", err);
    }

    return NextResponse.json({ success: true, couple });
  } catch (error) {
    console.error("Create couple error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const coupleId = (session.user as any).coupleId;

    if (!coupleId) {
      return NextResponse.json({ error: "Not part of any space" }, { status: 400 });
    }

    // Detach user from the couple
    await prisma.user.update({
      where: { id: userId },
      data: { coupleId: null },
    });

    // Check if there are any remaining users
    const remainingUsers = await prisma.user.count({
      where: { coupleId },
    });

    // If no one is left, delete the couple entirely (which cascades to foods, activities, etc.)
    if (remainingUsers === 0) {
      await prisma.couple.delete({
        where: { id: coupleId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leave couple error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
