"use client";

import type { SlotSize } from "./types";
import { serverPlugins } from "./server-plugins";
import { ClockRenderer } from "./clock/renderer";
import { WeatherRenderer } from "./weather/renderer";
import { RssRenderer } from "./rss/renderer";
import { CustomHtmlRenderer } from "./custom-html/renderer";
import { WebhookRenderer } from "./webhook/renderer";
import type React from "react";

type RendererComponent = React.ComponentType<{
  config: Record<string, unknown>;
  data: unknown;
  slot: SlotSize;
}>;

const renderers: Record<string, RendererComponent> = {
  clock: ClockRenderer,
  weather: WeatherRenderer,
  rss: RssRenderer,
  "custom-html": CustomHtmlRenderer,
  webhook: WebhookRenderer,
};

export const plugins = serverPlugins.map((meta) => ({
  ...meta,
  Renderer: renderers[meta.id] ?? null,
}));

export function getPlugin(id: string) {
  return plugins.find((p) => p.id === id) ?? null;
}
