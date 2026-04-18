import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { playlistItems } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const items = await db
    .select()
    .from(playlistItems)
    .where(eq(playlistItems.playlistId, id))
    .orderBy(asc(playlistItems.position));
  return NextResponse.json(items);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const {
    layoutType = "full",
    durationSeconds = 30,
    slotA = null,
    slotB = null,
    slotC = null,
    slotD = null,
  } = body;

  // Get max position
  const existing = await db
    .select()
    .from(playlistItems)
    .where(eq(playlistItems.playlistId, id));

  const maxPosition = existing.length > 0
    ? Math.max(...existing.map((i) => i.position))
    : -1;

  const [item] = await db
    .insert(playlistItems)
    .values({
      playlistId: id,
      position: maxPosition + 1,
      layoutType,
      durationSeconds,
      slotA,
      slotB,
      slotC,
      slotD,
    })
    .returning();

  return NextResponse.json(item, { status: 201 });
}
