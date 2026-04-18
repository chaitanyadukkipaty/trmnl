"use client";

import { useEffect, useRef, useState } from "react";
import { usePlaylist } from "@/hooks/usePlaylist";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useDim } from "@/hooks/useDim";
import { LayoutRenderer } from "./LayoutRenderer";
import type { ResolvedPlaylistItem } from "@/widgets/types";

interface NightMode {
  enabled: boolean;
  dimFrom: string;
  dimTo: string;
  dimBrightness: number;
}

interface Props {
  nightMode?: NightMode | null;
}

export function PlaylistRunner({ nightMode }: Props) {
  const { state, error } = usePlaylist(5000);
  const { brightness, handleTap } = useDim(nightMode);
  const [visibleItem, setVisibleItem] = useState<ResolvedPlaylistItem | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const prevItemIdRef = useRef<string | null>(null);

  useWakeLock();

  useEffect(() => {
    if (!state) return;
    const newId = state.currentItem.id;

    if (prevItemIdRef.current !== newId) {
      // Transition to new item
      setTransitioning(true);
      setTimeout(() => {
        setVisibleItem(state.currentItem);
        prevItemIdRef.current = newId;
        setTransitioning(false);
      }, 300);
    } else if (!visibleItem) {
      setVisibleItem(state.currentItem);
      prevItemIdRef.current = newId;
    }
  }, [state, visibleItem]);

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full w-full bg-black text-gray-600 gap-4"
        onClick={handleTap}
      >
        <div className="text-5xl">📺</div>
        <div className="text-lg font-light">{error}</div>
        <div className="text-sm text-gray-700">
          Go to{" "}
          <a href="/admin" className="text-gray-500 underline">
            /admin
          </a>{" "}
          to set up your dashboard
        </div>
      </div>
    );
  }

  if (!visibleItem) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-black">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full bg-black overflow-hidden cursor-none"
      style={{ filter: `brightness(${brightness})`, transition: "filter 2s ease" }}
      onClick={handleTap}
    >
      <div
        className="h-full w-full transition-opacity duration-300"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        <LayoutRenderer item={visibleItem} />
      </div>

      {/* Progress dots */}
      {state && state.totalItems > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
          {Array.from({ length: state.totalItems }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === state.currentIndex
                  ? "w-4 h-1.5 bg-gray-400"
                  : "w-1.5 h-1.5 bg-gray-700"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
