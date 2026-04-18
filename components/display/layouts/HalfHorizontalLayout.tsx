"use client";

import type { ResolvedWidgetInstance } from "@/widgets/types";
import { WidgetSlot } from "../WidgetSlot";

interface Props {
  slotA: ResolvedWidgetInstance | null;
  slotB: ResolvedWidgetInstance | null;
}

export function HalfHorizontalLayout({ slotA, slotB }: Props) {
  return (
    <div className="grid grid-rows-2 w-full h-full divide-y divide-gray-800">
      <WidgetSlot widget={slotA} size="half" />
      <WidgetSlot widget={slotB} size="half" />
    </div>
  );
}
