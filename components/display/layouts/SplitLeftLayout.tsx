"use client";

import type { ResolvedWidgetInstance } from "@/widgets/types";
import { WidgetSlot } from "../WidgetSlot";

interface Props {
  slotA: ResolvedWidgetInstance | null;
  slotB: ResolvedWidgetInstance | null;
  slotC: ResolvedWidgetInstance | null;
}

export function SplitLeftLayout({ slotA, slotB, slotC }: Props) {
  return (
    <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
      <div className="row-span-2 border-r border-gray-800">
        <WidgetSlot widget={slotA} size="half" />
      </div>
      <div className="border-b border-gray-800">
        <WidgetSlot widget={slotB} size="quarter" />
      </div>
      <div>
        <WidgetSlot widget={slotC} size="quarter" />
      </div>
    </div>
  );
}
