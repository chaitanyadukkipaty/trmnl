"use client";

import type { ResolvedWidgetInstance } from "@/widgets/types";
import { WidgetSlot } from "../WidgetSlot";

interface Props {
  slotA: ResolvedWidgetInstance | null;
  slotB: ResolvedWidgetInstance | null;
  slotC: ResolvedWidgetInstance | null;
  slotD: ResolvedWidgetInstance | null;
}

export function QuadrantLayout({ slotA, slotB, slotC, slotD }: Props) {
  return (
    <div className="grid grid-cols-2 grid-rows-2 w-full h-full divide-x divide-y divide-gray-800">
      <WidgetSlot widget={slotA} size="quarter" />
      <WidgetSlot widget={slotB} size="quarter" />
      <WidgetSlot widget={slotC} size="quarter" />
      <WidgetSlot widget={slotD} size="quarter" />
    </div>
  );
}
