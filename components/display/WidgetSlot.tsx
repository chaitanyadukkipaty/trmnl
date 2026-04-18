"use client";

import type { ResolvedWidgetInstance, SlotSize } from "@/widgets/types";
import { getPlugin } from "@/widgets/registry";

interface Props {
  widget: ResolvedWidgetInstance | null;
  size: SlotSize;
}

export function WidgetSlot({ widget, size }: Props) {
  if (!widget) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-gray-700 text-sm">
        Empty slot
      </div>
    );
  }

  const plugin = getPlugin(widget.pluginId);
  if (!plugin || !plugin.Renderer) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-red-900 text-xs p-4 text-center">
        Unknown plugin: {widget.pluginId}
      </div>
    );
  }

  const config = (widget.config ?? {}) as Record<string, unknown>;

  try {
    return (
      <div className="h-full w-full overflow-hidden">
        <plugin.Renderer config={config} data={widget.cachedData} slot={size} />
      </div>
    );
  } catch {
    return (
      <div className="flex items-center justify-center h-full bg-black text-red-900 text-xs p-4">
        Widget error
      </div>
    );
  }
}
