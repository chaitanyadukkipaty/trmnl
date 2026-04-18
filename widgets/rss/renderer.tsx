"use client";

import type { SlotSize } from "@/widgets/types";
import type { RssData } from "./fetcher";

interface Props {
  config: Record<string, unknown>;
  data: unknown;
  slot: SlotSize;
}

export function RssRenderer({ data, config, slot }: Props) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-gray-500 text-lg">
        No RSS data. Configure feed URL.
      </div>
    );
  }

  const feed = data as RssData;
  const showSource = config.showSource !== false;
  const isSmall = slot === "quarter";
  const maxItems = isSmall ? 4 : slot === "half" ? 6 : 8;
  const items = feed.items.slice(0, maxItems);

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
      {showSource && (
        <div className={`px-5 py-3 border-b border-gray-800 text-gray-400 uppercase tracking-widest ${isSmall ? "text-xs" : "text-sm"}`}>
          📰 {feed.title}
        </div>
      )}
      <div className="flex-1 overflow-hidden divide-y divide-gray-800">
        {items.map((item, i) => (
          <div key={i} className={`${isSmall ? "px-3 py-2" : "px-5 py-3"}`}>
            <div className={`font-medium leading-snug text-white ${isSmall ? "text-xs" : "text-sm"}`}>
              {item.title}
            </div>
            {!isSmall && item.description && (
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
