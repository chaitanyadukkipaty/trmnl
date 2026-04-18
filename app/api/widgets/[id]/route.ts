import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { widgetInstances } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [widget] = await db
    .select()
    .from(widgetInstances)
    .where(eq(widgetInstances.id, id));

  if (!widget) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(widget);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, config, refreshIntervalMinutes } = body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (name !== undefined) updates.name = name;
  if (config !== undefined) updates.config = config;
  if (refreshIntervalMinutes !== undefined) updates.refreshIntervalMinutes = refreshIntervalMinutes;

  const [widget] = await db
    .update(widgetInstances)
    .set(updates)
    .where(eq(widgetInstances.id, id))
    .returning();

  if (!widget) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(widget);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(widgetInstances).where(eq(widgetInstances.id, id));
  return new NextResponse(null, { status: 204 });
}
