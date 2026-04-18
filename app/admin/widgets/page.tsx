import { db } from "@/db";
import { widgetInstances } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { serverPlugins } from "@/widgets/server-plugins";
import { DeleteWidgetButton } from "./DeleteWidgetButton";

export default async function WidgetsPage() {
  const widgets = await db
    .select()
    .from(widgetInstances)
    .orderBy(desc(widgetInstances.createdAt));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Widgets</h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure data sources for your display
          </p>
        </div>
        <Link
          href="/admin/widgets/new"
          className="px-4 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          + Add Widget
        </Link>
      </div>

      {widgets.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <div className="text-4xl mb-4">🧩</div>
          <p>No widgets yet</p>
          <Link href="/admin/widgets/new" className="text-white underline text-sm mt-2 block">
            Create your first widget
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {widgets.map((w) => {
            const plugin = serverPlugins.find((p) => p.id === w.pluginId);
            return (
              <div
                key={w.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-800 bg-gray-900 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{plugin?.icon ?? "🔌"}</span>
                  <div>
                    <div className="font-medium">{w.name}</div>
                    <div className="text-xs text-gray-500">
                      {plugin?.name ?? w.pluginId} ·{" "}
                      {w.lastFetchedAt
                        ? `Updated ${new Date(w.lastFetchedAt).toLocaleString()}`
                        : "Never fetched"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/widgets/${w.id}`}
                    className="px-3 py-1.5 rounded border border-gray-700 text-xs hover:border-gray-500 transition-colors"
                  >
                    Edit
                  </Link>
                  <DeleteWidgetButton id={w.id} name={w.name} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
