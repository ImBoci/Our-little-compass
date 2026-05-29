import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { name },
    });

    return NextResponse.json({ success: true, user: { id: updatedUser.id, name: updatedUser.name } });
  } catch (error) {
    console.error("Update user error:", error);
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

    // Find the user's coupleId before deleting
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coupleId: true },
    });

    const coupleId = user?.coupleId;

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    // Check if the couple is now empty. If so, delete the couple.
    if (coupleId) {
      const remainingUsers = await prisma.user.count({
        where: { coupleId },
      });

      if (remainingUsers === 0) {
        await prisma.couple.delete({
          where: { id: coupleId },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
