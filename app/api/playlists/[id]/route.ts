import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { playlists, settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [playlist] = await db
    .select()
    .from(playlists)
    .where(eq(playlists.id, id));
  if (!playlist) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(playlist);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, isActive } = body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (isActive !== undefined) updates.isActive = isActive;

  // If activating this playlist, update the global setting
  if (isActive === true) {
    await db
      .insert(settings)
      .values({ key: "active_playlist_id", value: id })
      .onConflictDoUpdate({ target: settings.key, set: { value: id } });
  }

  const [playlist] = await db
    .update(playlists)
    .set(updates)
    .where(eq(playlists.id, id))
    .returning();

  if (!playlist) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(playlist);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(playlists).where(eq(playlists.id, id));
  return new NextResponse(null, { status: 204 });
}
