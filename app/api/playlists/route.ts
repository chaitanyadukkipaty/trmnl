import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { playlists } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const all = await db
    .select()
    .from(playlists)
    .orderBy(desc(playlists.createdAt));
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const [playlist] = await db
    .insert(playlists)
    .values({ name, isActive: false })
    .returning();

  return NextResponse.json(playlist, { status: 201 });
}
