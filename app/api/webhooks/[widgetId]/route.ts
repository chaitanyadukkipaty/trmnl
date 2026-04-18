import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { widgetInstances, webhookPayloads } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  const { widgetId } = await params;

  const [widget] = await db
    .select()
    .from(widgetInstances)
    .where(eq(widgetInstances.id, widgetId));

  if (!widget) {
    return NextResponse.json({ error: "Widget not found" }, { status: 404 });
  }

  if (widget.pluginId !== "webhook") {
    return NextResponse.json(
      { error: "Widget is not a webhook type" },
      { status: 400 }
    );
  }

  let payload: unknown;
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    payload = await req.json();
  } else {
    const text = await req.text();
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { text };
    }
  }

  const now = new Date();

  // Store payload history
  await db.insert(webhookPayloads).values({
    widgetInstanceId: widgetId,
    payload,
    receivedAt: now,
  });

  // Update cached data so the display reflects the new payload
  await db
    .update(widgetInstances)
    .set({ cachedData: payload, lastFetchedAt: now, updatedAt: now })
    .where(eq(widgetInstances.id, widgetId));

  return NextResponse.json({ ok: true, receivedAt: now.toISOString() });
}
