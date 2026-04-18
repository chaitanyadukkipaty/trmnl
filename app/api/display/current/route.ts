import { NextResponse } from "next/server";
import { db } from "@/db";
import { playlists, playlistItems, widgetInstances, settings } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getCurrentPlaylistItem } from "@/lib/playlist-scheduler";
import type { ResolvedPlaylistItem, ResolvedWidgetInstance } from "@/widgets/types";

async function resolveWidget(id: string | null): Promise<ResolvedWidgetInstance | null> {
  if (!id) return null;
  const [w] = await db.select().from(widgetInstances).where(eq(widgetInstances.id, id));
  if (!w) return null;
  return {
    id: w.id,
    pluginId: w.pluginId,
    name: w.name,
    config: (w.config ?? {}) as Record<string, unknown>,
    cachedData: w.cachedData ?? null,
    lastFetchedAt: w.lastFetchedAt,
    refreshIntervalMinutes: w.refreshIntervalMinutes,
  };
}

export async function GET() {
  try {
    // Get active playlist
    const [settingRow] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "active_playlist_id"));

    let activePlaylist = null;

    if (settingRow?.value) {
      const [p] = await db
        .select()
        .from(playlists)
        .where(eq(playlists.id, settingRow.value as string));
      activePlaylist = p ?? null;
    }

    if (!activePlaylist) {
      // Fall back to first active playlist
      const [p] = await db
        .select()
        .from(playlists)
        .where(eq(playlists.isActive, true));
      activePlaylist = p ?? null;
    }

    if (!activePlaylist) {
      return NextResponse.json(
        { error: "No active playlist. Create one at /admin/playlists" },
        { status: 404 }
      );
    }

    const items = await db
      .select()
      .from(playlistItems)
      .where(eq(playlistItems.playlistId, activePlaylist.id))
      .orderBy(asc(playlistItems.position));

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Playlist has no items. Add widgets at /admin/playlists" },
        { status: 404 }
      );
    }

    // Resolve all widget slots
    const resolvedItems: ResolvedPlaylistItem[] = await Promise.all(
      items.map(async (item) => {
        const [a, b, c, d] = await Promise.all([
          resolveWidget(item.slotA),
          resolveWidget(item.slotB),
          resolveWidget(item.slotC),
          resolveWidget(item.slotD),
        ]);
        return {
          id: item.id,
          playlistId: item.playlistId,
          position: item.position,
          layoutType: item.layoutType as ResolvedPlaylistItem["layoutType"],
          durationSeconds: item.durationSeconds,
          slots: { a, b, c, d },
        };
      })
    );

    const { item: currentItem, secondsUntilNext, index } = getCurrentPlaylistItem(
      resolvedItems,
      new Date()
    );

    const nextIndex = (index + 1) % resolvedItems.length;
    const nextItem = resolvedItems.length > 1 ? resolvedItems[nextIndex] : null;

    return NextResponse.json({
      currentItem,
      nextItem,
      secondsUntilNext,
      totalItems: resolvedItems.length,
      currentIndex: index,
    });
  } catch (err) {
    console.error("[display/current]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
