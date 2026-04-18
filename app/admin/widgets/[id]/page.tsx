import { db } from "@/db";
import { widgetInstances } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { serverPlugins } from "@/widgets/server-plugins";
import { WidgetForm } from "../WidgetForm";

export default async function EditWidgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [widget] = await db
    .select()
    .from(widgetInstances)
    .where(eq(widgetInstances.id, id));

  if (!widget) notFound();

  const plugins = serverPlugins.map(({ fetcher, ...meta }) => ({
    ...meta,
    hasFetcher: !!fetcher,
  }));

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Edit Widget</h1>
      <p className="text-gray-500 text-sm mb-8">{widget.name}</p>
      <WidgetForm
        plugins={plugins}
        initialData={{
          id: widget.id,
          pluginId: widget.pluginId,
          name: widget.name,
          config: (widget.config ?? {}) as Record<string, unknown>,
          refreshIntervalMinutes: widget.refreshIntervalMinutes,
        }}
      />
    </div>
  );
}
