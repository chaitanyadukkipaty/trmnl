export interface RssItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

export interface RssData {
  title: string;
  items: RssItem[];
  fetchedAt: string;
}

function extractText(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

function parseTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? extractText(match[1]) : "";
}

function parseCDATA(xml: string, tag: string): string {
  const match = xml.match(
    new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`)
  );
  if (match) return match[1].trim();
  return parseTag(xml, tag);
}

export async function fetchRss(
  config: Record<string, unknown>
): Promise<RssData> {
  const { feedUrl, maxItems = 10 } = config as {
    feedUrl: string;
    maxItems?: number;
  };

  if (!feedUrl) throw new Error("Feed URL is required");

  const response = await fetch(feedUrl, {
    headers: { "User-Agent": "Dashboard/1.0 RSS Reader" },
  });

  if (!response.ok) throw new Error(`RSS fetch error: ${response.status}`);

  const xml = await response.text();

  const channelTitle = parseCDATA(xml, "title") || "RSS Feed";
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

  const items: RssItem[] = [];
  for (const match of itemMatches) {
    if (items.length >= Number(maxItems)) break;
    const itemXml = match[1];
    items.push({
      title: parseCDATA(itemXml, "title"),
      description: parseCDATA(itemXml, "description").slice(0, 200),
      link: parseTag(itemXml, "link"),
      pubDate: parseTag(itemXml, "pubDate"),
    });
  }

  return {
    title: channelTitle,
    items,
    fetchedAt: new Date().toISOString(),
  };
}
