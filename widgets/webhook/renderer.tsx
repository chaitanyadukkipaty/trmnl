"use client";

import type { SlotSize } from "@/widgets/types";
import Mustache from "mustache";

interface Props {
  config: Record<string, unknown>;
  data: unknown;
  slot: SlotSize;
}

export function WebhookRenderer({ config, data }: Props) {
  const template = (config.template as string) ?? "<p>No template configured.</p>";
  const title = config.title as string | undefined;

  let rendered = "";
  try {
    rendered = Mustache.render(template, (data as Record<string, unknown>) ?? {});
  } catch {
    rendered = `<p style="color: #f87171;">Template error</p>`;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; color: #fff; font-family: sans-serif; width: 100%; height: 100vh; overflow: hidden; padding: 16px; }
  h1,h2,h3 { font-weight: bold; margin-bottom: 8px; }
  p { margin-bottom: 6px; }
</style>
</head>
<body>${rendered}</body>
</html>`;

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
      {title && (
        <div className="px-4 py-2 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-widest">
          🔗 {title}
        </div>
      )}
      {data === null || data === undefined ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm p-4">
          Waiting for webhook data…
          <br />
          <span className="text-xs text-gray-700 mt-2 block">POST JSON to /api/webhooks/[widget-id]</span>
        </div>
      ) : (
        <iframe
          srcDoc={html}
          className="flex-1 w-full border-0"
          sandbox="allow-scripts"
          title="Webhook Widget"
        />
      )}
    </div>
  );
}
