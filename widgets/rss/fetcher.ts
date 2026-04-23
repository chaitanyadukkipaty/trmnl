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

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, " ");
}

function extractText(str: string): string {
  return decodeEntities(str).replace(/<[^>]*>/g, "").trim();
}

function parseTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? extractText(match[1]) : "";
}

function parseCDATA(xml: string, tag: string): string {
  const match = xml.match(
    new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`)
  );
  if (match) return extractText(match[1]);
  return parseTag(xml, tag);
}

// Handles both RSS <link>url</link> and Atom <link rel="alternate" href="url"/>
function parseLink(xml: string): string {
  const rssLink = parseTag(xml, "link");
  if (rssLink) return rssLink;
  const m = xml.match(/<link[^>]+href="([^"]+)"/);
  return m ? m[1] : "";
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

  // Detect Atom vs RSS
  const isAtom = /<feed[\s>]/.test(xml);
  const itemTag = isAtom ? "entry" : "item";

  // Extract channel/feed title from the header section (before first item)
  const headerSection = xml.slice(0, xml.search(new RegExp(`<${itemTag}[\\s>]`)));
  const channelTitle =
    parseCDATA(headerSection, "title") ||
    parseTag(headerSection, "title") ||
    "RSS Feed";

  const itemMatches = xml.matchAll(
    new RegExp(`<${itemTag}[\\s>]([\\s\\S]*?)<\\/${itemTag}>`, "g")
  );

  const items: RssItem[] = [];
  for (const match of itemMatches) {
    if (items.length >= Number(maxItems)) break;
    const itemXml = match[1];
    items.push({
      title: parseCDATA(itemXml, "title"),
      description: (
        parseCDATA(itemXml, "description") ||
        parseCDATA(itemXml, "summary") ||
        parseCDATA(itemXml, "content")
      ).slice(0, 200),
      link: parseLink(itemXml),
      pubDate:
        parseTag(itemXml, "pubDate") ||
        parseTag(itemXml, "published") ||
        parseTag(itemXml, "updated"),
    });
  }

  return {
    title: channelTitle,
    items,
    fetchedAt: new Date().toISOString(),
  };
}
