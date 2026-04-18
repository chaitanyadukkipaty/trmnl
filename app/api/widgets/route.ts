import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { widgetInstances } from "@/db/schema";
import { serverPlugins } from "@/widgets/server-plugins";
import { desc } from "drizzle-orm";

export async function GET() {
  const widgets = await db
    .select()
    .from(widgetInstances)
    .orderBy(desc(widgetInstances.createdAt));
  return NextResponse.json(widgets);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pluginId, name, config, refreshIntervalMinutes } = body;

  if (!pluginId || !name) {
    return NextResponse.json(
      { error: "pluginId and name are required" },
      { status: 400 }
    );
  }

  const plugin = serverPlugins.find((p) => p.id === pluginId);
  if (!plugin) {
    return NextResponse.json({ error: "Unknown plugin" }, { status: 400 });
  }

  const [widget] = await db
    .insert(widgetInstances)
    .values({
      pluginId,
      name,
      config: config ?? {},
      refreshIntervalMinutes: refreshIntervalMinutes ?? plugin.defaultRefreshMinutes,
    })
    .returning();

  return NextResponse.json(widget, { status: 201 });
}
