import { db } from "@/db";
import { playlists, playlistItems, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { DeletePlaylistButton } from "./DeletePlaylistButton";
import { ActivatePlaylistButton } from "./ActivatePlaylistButton";

export default async function PlaylistsPage() {
  const [allPlaylists, settingRows] = await Promise.all([
    db.select().from(playlists),
    db.select().from(settings).where(eq(settings.key, "active_playlist_id")),
  ]);

  const activeId = (settingRows[0]?.value as string) ?? null;

  const playlistsWithCounts = await Promise.all(
    allPlaylists.map(async (pl) => {
      const items = await db
        .select()
        .from(playlistItems)
        .where(eq(playlistItems.playlistId, pl.id));
      return { ...pl, itemCount: items.length };
    })
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Playlists</h1>
          <p className="text-gray-500 text-sm mt-1">
            Sequences of layouts that rotate on the display
          </p>
        </div>
        <Link
          href="/admin/playlists/new"
          className="px-4 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          + New Playlist
        </Link>
      </div>

      {playlistsWithCounts.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <div className="text-4xl mb-4">📋</div>
          <p>No playlists yet</p>
          <Link href="/admin/playlists/new" className="text-white underline text-sm mt-2 block">
            Create your first playlist
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {playlistsWithCounts.map((pl) => (
            <div
              key={pl.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                pl.id === activeId
                  ? "border-green-700 bg-green-950"
                  : "border-gray-800 bg-gray-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{pl.name}</span>
                    {pl.id === activeId && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-800 text-green-300">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {pl.itemCount} {pl.itemCount === 1 ? "item" : "items"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pl.id !== activeId && (
                  <ActivatePlaylistButton id={pl.id} />
                )}
                <Link
                  href={`/admin/playlists/${pl.id}`}
                  className="px-3 py-1.5 rounded border border-gray-700 text-xs hover:border-gray-500 transition-colors"
                >
                  Edit
                </Link>
                <DeletePlaylistButton id={pl.id} name={pl.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
