import { NextRequest, NextResponse } from "next/server";
import { refreshStaleWidgets } from "@/lib/widget-runner";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;

  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await refreshStaleWidgets();
  return NextResponse.json(result);
}
