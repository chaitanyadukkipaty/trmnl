"use client";

import { useState, useEffect, useCallback } from "react";
import type { DisplayState } from "@/widgets/types";

export function usePlaylist(pollIntervalMs = 5000) {
  const [state, setState] = useState<DisplayState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrent = useCallback(async () => {
    try {
      const res = await fetch("/api/display/current", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to load display");
        return;
      }
      const data: DisplayState = await res.json();
      setState(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
  }, []);

  useEffect(() => {
    fetchCurrent();
    const interval = setInterval(fetchCurrent, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchCurrent, pollIntervalMs]);

  return { state, error, refetch: fetchCurrent };
}
