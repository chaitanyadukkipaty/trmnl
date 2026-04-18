"use client";

import type { SlotSize } from "@/widgets/types";

interface Props {
  config: Record<string, unknown>;
  data: unknown;
  slot: SlotSize;
}

export function CustomHtmlRenderer({ config }: Props) {
  const content = (config.content as string) ?? "<p>No content configured.</p>";
  const bg = (config.backgroundColor as string) ?? "#000000";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: ${bg}; color: #fff; font-family: sans-serif; width: 100%; height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; }
</style>
</head>
<body>${content}</body>
</html>`;

  return (
    <iframe
      srcDoc={html}
      className="w-full h-full border-0"
      sandbox="allow-scripts"
      title="Custom HTML Widget"
    />
  );
}
