import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";

export async function GET() {
  const all = await db.select().from(settings);
  const map: Record<string, unknown> = {};
  for (const row of all) {
    map[row.key] = row.value;
  }
  return NextResponse.json(map);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const entries = Object.entries(body);

  for (const [key, value] of entries) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }

  return NextResponse.json({ ok: true });
}
