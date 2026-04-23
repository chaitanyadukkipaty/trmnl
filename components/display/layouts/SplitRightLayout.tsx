"use client";

import type { ResolvedWidgetInstance } from "@/widgets/types";
import { WidgetSlot } from "../WidgetSlot";

interface Props {
  slotA: ResolvedWidgetInstance | null;
  slotB: ResolvedWidgetInstance | null;
  slotC: ResolvedWidgetInstance | null;
}

export function SplitRightLayout({ slotA, slotB, slotC }: Props) {
  return (
    <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
      <div className="border-b border-r border-gray-800">
        <WidgetSlot widget={slotA} size="quarter" />
      </div>
      <div className="row-span-2 border-l border-gray-800">
        <WidgetSlot widget={slotB} size="half" />
      </div>
      <div className="border-r border-gray-800">
        <WidgetSlot widget={slotC} size="quarter" />
      </div>
    </div>
  );
}
