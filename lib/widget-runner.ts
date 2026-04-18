import { db } from "@/db";
import { widgetInstances } from "@/db/schema";
import { serverPlugins } from "@/widgets/server-plugins";
import { eq, lt, or, isNull } from "drizzle-orm";

/**
 * Refreshes all widget instances whose data is stale.
 * Called by the cron route every minute.
 */
export async function refreshStaleWidgets(): Promise<{
  refreshed: number;
  errors: { id: string; error: string }[];
}> {
  const now = new Date();
  const allWidgets = await db.select().from(widgetInstances);

  const stale = allWidgets.filter((w) => {
    const plugin = serverPlugins.find((p) => p.id === w.pluginId);
    if (!plugin?.fetcher) return false; // skip push-only widgets

    if (!w.lastFetchedAt) return true;

    const intervalMs = w.refreshIntervalMinutes * 60 * 1000;
    return now.getTime() - w.lastFetchedAt.getTime() >= intervalMs;
  });

  let refreshed = 0;
  const errors: { id: string; error: string }[] = [];

  for (const widget of stale) {
    const plugin = serverPlugins.find((p) => p.id === widget.pluginId);
    if (!plugin?.fetcher) continue;

    try {
      const config = (widget.config ?? {}) as Record<string, unknown>;
      const data = await plugin.fetcher(config);
      await db
        .update(widgetInstances)
        .set({ cachedData: data, lastFetchedAt: now, updatedAt: now })
        .where(eq(widgetInstances.id, widget.id));
      refreshed++;
    } catch (err) {
      errors.push({
        id: widget.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { refreshed, errors };
}

/**
 * Force-refreshes a single widget instance.
 */
export async function refreshWidget(widgetId: string): Promise<void> {
  const [widget] = await db
    .select()
    .from(widgetInstances)
    .where(eq(widgetInstances.id, widgetId));

  if (!widget) throw new Error("Widget not found");

  const plugin = serverPlugins.find((p) => p.id === widget.pluginId);
  if (!plugin?.fetcher) throw new Error("Plugin has no fetcher");

  const config = (widget.config ?? {}) as Record<string, unknown>;
  const data = await plugin.fetcher(config);
  const now = new Date();

  await db
    .update(widgetInstances)
    .set({ cachedData: data, lastFetchedAt: now, updatedAt: now })
    .where(eq(widgetInstances.id, widgetId));
}
