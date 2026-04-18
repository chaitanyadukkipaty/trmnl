import type { ResolvedPlaylistItem } from "@/widgets/types";

export interface SchedulerResult {
  item: ResolvedPlaylistItem;
  secondsUntilNext: number;
  index: number;
}

/**
 * Computes which playlist item is currently active based on wall clock time.
 * Stateless — multiple devices stay in sync automatically.
 */
export function getCurrentPlaylistItem(
  items: ResolvedPlaylistItem[],
  now: Date = new Date()
): SchedulerResult {
  if (items.length === 0) {
    throw new Error("Playlist has no items");
  }

  if (items.length === 1) {
    return {
      item: items[0],
      secondsUntilNext: items[0].durationSeconds,
      index: 0,
    };
  }

  const totalDuration = items.reduce((sum, i) => sum + i.durationSeconds, 0);
  const elapsedSeconds = (now.getTime() / 1000) % totalDuration;

  let cursor = 0;
  for (let i = 0; i < items.length; i++) {
    cursor += items[i].durationSeconds;
    if (elapsedSeconds < cursor) {
      const secondsUntilNext = cursor - elapsedSeconds;
      return { item: items[i], secondsUntilNext, index: i };
    }
  }

  // Floating point edge case: return last item
  const last = items[items.length - 1];
  return { item: last, secondsUntilNext: last.durationSeconds, index: items.length - 1 };
}
