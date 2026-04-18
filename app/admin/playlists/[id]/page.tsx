import { db } from "@/db";
import { playlists, playlistItems, widgetInstances, settings } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { serverPlugins } from "@/widgets/server-plugins";
import { PlaylistEditor } from "./PlaylistEditor";

export default async function EditPlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [playlist] = await db
    .select()
    .from(playlists)
    .where(eq(playlists.id, id));

  if (!playlist) notFound();

  const [items, allWidgets, settingRows] = await Promise.all([
    db
      .select()
      .from(playlistItems)
      .where(eq(playlistItems.playlistId, id))
      .orderBy(asc(playlistItems.position)),
    db.select().from(widgetInstances),
    db.select().from(settings).where(eq(settings.key, "active_playlist_id")),
  ]);

  const activeId = (settingRows[0]?.value as string) ?? null;

  const widgetOptions = allWidgets.map((w) => {
    const plugin = serverPlugins.find((p) => p.id === w.pluginId);
    return {
      id: w.id,
      name: w.name,
      pluginId: w.pluginId,
      icon: plugin?.icon ?? "🔌",
    };
  });

  return (
    <div className="p-8 max-w-2xl">
      <PlaylistEditor
        playlistId={id}
        playlistName={playlist.name}
        initialItems={items}
        widgets={widgetOptions}
        isActive={activeId === id}
      />
    </div>
  );
}
