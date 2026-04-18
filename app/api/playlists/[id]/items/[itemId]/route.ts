import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { playlistItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params;
  const body = await req.json();
  const { layoutType, durationSeconds, slotA, slotB, slotC, slotD, position } = body;

  const updates: Record<string, unknown> = {};
  if (layoutType !== undefined) updates.layoutType = layoutType;
  if (durationSeconds !== undefined) updates.durationSeconds = durationSeconds;
  if (slotA !== undefined) updates.slotA = slotA;
  if (slotB !== undefined) updates.slotB = slotB;
  if (slotC !== undefined) updates.slotC = slotC;
  if (slotD !== undefined) updates.slotD = slotD;
  if (position !== undefined) updates.position = position;

  const [item] = await db
    .update(playlistItems)
    .set(updates)
    .where(and(eq(playlistItems.id, itemId), eq(playlistItems.playlistId, id)))
    .returning();

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params;
  await db
    .delete(playlistItems)
    .where(and(eq(playlistItems.id, itemId), eq(playlistItems.playlistId, id)));
  return new NextResponse(null, { status: 204 });
}
