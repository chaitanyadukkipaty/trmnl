export interface AqiData {
  aqi: number;
  category: string;
  categoryShort: string;
  city: string;
  pm25: number | null;
  pm10: number | null;
  co: number | null;   // ppm
  so2: number | null;  // ppb
  no2: number | null;  // ppb
  o3: number | null;   // ppb
  temp: number | null; // °C
  humidity: number | null; // %
  wind: number | null; // m/s
  fetchedAt: string;
}

function getCategory(aqi: number): { label: string; short: string } {
  if (aqi <= 50) return { label: "Good", short: "Good" };
  if (aqi <= 100) return { label: "Moderate", short: "Moderate" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", short: "Sensitive" };
  if (aqi <= 200) return { label: "Unhealthy", short: "Unhealthy" };
  if (aqi <= 300) return { label: "Very Unhealthy", short: "Very Unhealthy" };
  return { label: "Hazardous", short: "Hazardous" };
}

export async function fetchAqi(config: Record<string, unknown>): Promise<AqiData> {
  const { token, city = "mumbai" } = config as { token: string; city?: string };

  if (!token) throw new Error("AQICN API token is required");

  const url = `https://api.waqi.info/feed/${encodeURIComponent(city as string)}/?token=${token}`;
  const response = await fetch(url, { next: { revalidate: 0 } } as RequestInit);

  if (!response.ok) throw new Error(`AQI API error: ${response.status}`);

  const json = await response.json();

  if (json.status !== "ok") throw new Error(`AQI API: ${json.data ?? "unknown error"}`);

  const d = json.data;
  const iaqi = d.iaqi ?? {};
  const { label, short } = getCategory(d.aqi);

  return {
    aqi: d.aqi,
    category: label,
    categoryShort: short,
    city: d.city?.name ?? String(city),
    pm25: iaqi.pm25?.v ?? null,
    pm10: iaqi.pm10?.v ?? null,
    co: iaqi.co?.v ?? null,
    so2: iaqi.so2?.v ?? null,
    no2: iaqi.no2?.v ?? null,
    o3: iaqi.o3?.v ?? null,
    temp: iaqi.t?.v ?? null,
    humidity: iaqi.h?.v ?? null,
    wind: iaqi.w?.v ?? null,
    fetchedAt: new Date().toISOString(),
  };
}
