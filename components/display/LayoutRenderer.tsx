"use client";

import type { ResolvedPlaylistItem } from "@/widgets/types";
import { FullLayout } from "./layouts/FullLayout";
import { HalfVerticalLayout } from "./layouts/HalfVerticalLayout";
import { HalfHorizontalLayout } from "./layouts/HalfHorizontalLayout";
import { QuadrantLayout } from "./layouts/QuadrantLayout";
import { SplitLeftLayout } from "./layouts/SplitLeftLayout";
import { SplitRightLayout } from "./layouts/SplitRightLayout";

interface Props {
  item: ResolvedPlaylistItem;
}

export function LayoutRenderer({ item }: Props) {
  const { slots, layoutType } = item;

  switch (layoutType) {
    case "full":
      return <FullLayout slotA={slots.a} />;
    case "half-vertical":
      return <HalfVerticalLayout slotA={slots.a} slotB={slots.b} />;
    case "half-horizontal":
      return <HalfHorizontalLayout slotA={slots.a} slotB={slots.b} />;
    case "quadrant":
      return (
        <QuadrantLayout
          slotA={slots.a}
          slotB={slots.b}
          slotC={slots.c}
          slotD={slots.d}
        />
      );
    case "split-left":
      return <SplitLeftLayout slotA={slots.a} slotB={slots.b} slotC={slots.c} />;
    case "split-right":
      return <SplitRightLayout slotA={slots.a} slotB={slots.b} slotC={slots.c} />;
    default:
      return <FullLayout slotA={slots.a} />;
  }
}
