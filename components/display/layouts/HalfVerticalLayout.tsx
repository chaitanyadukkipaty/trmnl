"use client";

import type { ResolvedWidgetInstance } from "@/widgets/types";
import { WidgetSlot } from "../WidgetSlot";

interface Props {
  slotA: ResolvedWidgetInstance | null;
  slotB: ResolvedWidgetInstance | null;
}

export function HalfVerticalLayout({ slotA, slotB }: Props) {
  return (
    <div className="grid grid-cols-2 w-full h-full divide-x divide-gray-800">
      <WidgetSlot widget={slotA} size="half" />
      <WidgetSlot widget={slotB} size="half" />
    </div>
  );
}
