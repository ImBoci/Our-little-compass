import { NextResponse } from "next/server";

// Force dynamic to prevent static generation issues
export const dynamic = "force-dynamic";

export async function GET() {
  // Return dummy data to prove the file itself is valid
  return NextResponse.json([
    { id: 1, name: "Test Activity", description: "Sanity check", type: "Test", location: "Server" }
  ]);
}

export async function POST() {
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}