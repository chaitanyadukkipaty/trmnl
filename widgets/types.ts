export type LayoutType =
  | "full"
  | "half-vertical"
  | "half-horizontal"
  | "quadrant";

export type SlotSize = "full" | "half" | "quarter";

export interface PluginConfigField {
  key: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "boolean" | "password";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: string | number | boolean;
  helpText?: string;
}

export interface PluginMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultRefreshMinutes: number;
  configFields: PluginConfigField[];
  // Server-side data fetcher; undefined = push-only (webhook, clock)
  fetcher?: (config: Record<string, unknown>) => Promise<unknown>;
}

export interface ResolvedWidgetInstance {
  id: string;
  pluginId: string;
  name: string;
  config: Record<string, unknown>;
  cachedData: unknown;
  lastFetchedAt: Date | null;
  refreshIntervalMinutes: number;
}

export interface ResolvedPlaylistItem {
  id: string;
  playlistId: string;
  position: number;
  layoutType: LayoutType;
  durationSeconds: number;
  slots: {
    a: ResolvedWidgetInstance | null;
    b: ResolvedWidgetInstance | null;
    c: ResolvedWidgetInstance | null;
    d: ResolvedWidgetInstance | null;
  };
}

export interface DisplayState {
  currentItem: ResolvedPlaylistItem;
  nextItem: ResolvedPlaylistItem | null;
  secondsUntilNext: number;
  totalItems: number;
  currentIndex: number;
}
