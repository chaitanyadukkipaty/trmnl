import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PlaylistRunner } from "@/components/display/PlaylistRunner";

async function getNightMode() {
  try {
    const [row] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "night_mode"));
    return (row?.value as {
      enabled: boolean;
      dimFrom: string;
      dimTo: string;
      dimBrightness: number;
    } | null) ?? null;
  } catch {
    return null;
  }
}

export default async function DisplayPage() {
  const nightMode = await getNightMode();
  return <PlaylistRunner nightMode={nightMode} />;
}
