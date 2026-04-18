import { db } from "@/db";
import { settings } from "@/db/schema";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const rows = await db.select().from(settings);
  const map: Record<string, unknown> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }

  const nightMode = (map["night_mode"] as {
    enabled: boolean;
    dimFrom: string;
    dimTo: string;
    dimBrightness: number;
  }) ?? {
    enabled: false,
    dimFrom: "22:00",
    dimTo: "07:00",
    dimBrightness: 0.1,
  };

  const cronSecret = process.env.CRON_SECRET ?? "";

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Configure display behavior</p>
      <SettingsForm nightMode={nightMode} cronSecret={cronSecret} />
    </div>
  );
}
