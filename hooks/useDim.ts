"use client";

import { useState, useEffect, useCallback } from "react";

interface NightModeSettings {
  enabled: boolean;
  dimFrom: string; // "HH:MM"
  dimTo: string; // "HH:MM"
  dimBrightness: number; // 0–1
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isInNightWindow(from: string, to: string): boolean {
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const fromMin = timeToMinutes(from);
  const toMin = timeToMinutes(to);

  if (fromMin <= toMin) {
    return currentMin >= fromMin && currentMin < toMin;
  }
  // Overnight window (e.g. 22:00 → 07:00)
  return currentMin >= fromMin || currentMin < toMin;
}

export function useDim(settings?: NightModeSettings | null) {
  const [isDimmed, setIsDimmed] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [overrideTimer, setOverrideTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const computeShouldDim = useCallback(() => {
    if (!settings?.enabled) return false;
    return isInNightWindow(settings.dimFrom, settings.dimTo);
  }, [settings]);

  useEffect(() => {
    if (!manualOverride) {
      setIsDimmed(computeShouldDim());
    }

    const interval = setInterval(() => {
      if (!manualOverride) {
        setIsDimmed(computeShouldDim());
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [computeShouldDim, manualOverride]);

  const handleTap = useCallback(() => {
    if (overrideTimer) clearTimeout(overrideTimer);

    if (isDimmed) {
      // Temporarily un-dim for 30 seconds
      setManualOverride(true);
      setIsDimmed(false);
      const t = setTimeout(() => {
        setManualOverride(false);
        setIsDimmed(computeShouldDim());
      }, 30_000);
      setOverrideTimer(t);
    } else {
      setManualOverride(false);
      setIsDimmed(computeShouldDim());
    }
  }, [isDimmed, overrideTimer, computeShouldDim]);

  const brightness = isDimmed ? (settings?.dimBrightness ?? 0.15) : 1;
  return { isDimmed, brightness, handleTap };
}
