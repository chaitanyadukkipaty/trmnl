"use client";

import type { ResolvedWidgetInstance } from "@/widgets/types";
import { WidgetSlot } from "../WidgetSlot";

interface Props {
  slotA: ResolvedWidgetInstance | null;
}

export function FullLayout({ slotA }: Props) {
  return (
    <div className="w-full h-full">
      <WidgetSlot widget={slotA} size="full" />
    </div>
  );
}
