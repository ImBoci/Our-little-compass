import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const lowercasedEmail = email.toLowerCase();

    // Check if WhitelistedEmail table is empty
    const whitelistCount = await prisma.whitelistedEmail.count();
    let assignedRole = "USER";

    if (whitelistCount === 0) {
      // Fallback Bootstrap: if empty AND email is "your_real_email@example.com"
      if (lowercasedEmail === "vargadaniel001@gmail.com") {
        assignedRole = "ADMIN";
      } else {
        return NextResponse.json(
          { error: "This application is private. Registration is restricted." },
          { status: 403 }
        );
      }
    } else {
      // Check if email exists in WhitelistedEmail table
      const isWhitelisted = await prisma.whitelistedEmail.findUnique({
        where: { email: lowercasedEmail }
      });

      if (!isWhitelisted) {
        return NextResponse.json(
          { error: "This application is private. Registration is restricted." },
          { status: 403 }
        );
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: lowercasedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: lowercasedEmail,
        password: hashedPassword,
        role: assignedRole,
      },
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
