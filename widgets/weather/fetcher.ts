export interface WeatherConfig {
  lat: string;
  lon: string;
  units: "metric" | "imperial";
  apiKey: string;
}

export interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  high: number;
  low: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    icon: string;
    description: string;
  }>;
  units: "metric" | "imperial";
  fetchedAt: string;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function fetchWeather(
  config: Record<string, unknown>
): Promise<WeatherData> {
  const { lat, lon, units = "metric", apiKey } = config as unknown as WeatherConfig;

  if (!apiKey) throw new Error("OpenWeatherMap API key is required");
  if (!lat || !lon) throw new Error("Latitude and longitude are required");

  const [current, forecast] = await Promise.all([
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`
    ).then((r) => {
      if (!r.ok) throw new Error(`Weather API error: ${r.status}`);
      return r.json();
    }),
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&cnt=24&appid=${apiKey}`
    ).then((r) => {
      if (!r.ok) throw new Error(`Forecast API error: ${r.status}`);
      return r.json();
    }),
  ]);

  // Group forecast by day (take one entry per day at noon)
  const dailyMap = new Map<
    string,
    { high: number; low: number; icon: string; description: string }
  >();
  for (const item of forecast.list) {
    const date = new Date(item.dt * 1000);
    const key = date.toISOString().split("T")[0];
    if (!dailyMap.has(key)) {
      dailyMap.set(key, {
        high: item.main.temp_max,
        low: item.main.temp_min,
        icon: item.weather[0].icon,
        description: item.weather[0].description,
      });
    } else {
      const existing = dailyMap.get(key)!;
      existing.high = Math.max(existing.high, item.main.temp_max);
      existing.low = Math.min(existing.low, item.main.temp_min);
    }
  }

  const forecastDays = Array.from(dailyMap.entries())
    .slice(1, 4)
    .map(([dateStr, data]) => ({
      day: DAY_NAMES[new Date(dateStr + "T12:00:00").getDay()],
      ...data,
    }));

  return {
    city: current.name,
    temp: Math.round(current.main.temp),
    feelsLike: Math.round(current.main.feels_like),
    description: current.weather[0].description,
    icon: current.weather[0].icon,
    humidity: current.main.humidity,
    windSpeed: Math.round(current.wind?.speed ?? 0),
    high: Math.round(current.main.temp_max),
    low: Math.round(current.main.temp_min),
    forecast: forecastDays,
    units: units as "metric" | "imperial",
    fetchedAt: new Date().toISOString(),
  };
}
