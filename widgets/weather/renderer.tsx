"use client";

import type { SlotSize } from "@/widgets/types";
import type { WeatherData } from "./fetcher";

interface Props {
  config: Record<string, unknown>;
  data: unknown;
  slot: SlotSize;
}

const WEATHER_ICONS: Record<string, string> = {
  "01d": "☀️", "01n": "🌙",
  "02d": "⛅", "02n": "⛅",
  "03d": "☁️", "03n": "☁️",
  "04d": "☁️", "04n": "☁️",
  "09d": "🌧️", "09n": "🌧️",
  "10d": "🌦️", "10n": "🌧️",
  "11d": "⛈️", "11n": "⛈️",
  "13d": "❄️", "13n": "❄️",
  "50d": "🌫️", "50n": "🌫️",
};

function WeatherIcon({ code, size }: { code: string; size: string }) {
  return <span className={`${size} leading-none`}>{WEATHER_ICONS[code] ?? "🌡️"}</span>;
}

export function WeatherRenderer({ data, slot }: Props) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-gray-500 text-lg">
        No weather data. Configure API key and location.
      </div>
    );
  }

  const w = data as WeatherData;
  const unit = w.units === "imperial" ? "°F" : "°C";
  const windUnit = w.units === "imperial" ? "mph" : "m/s";
  const isSmall = slot === "quarter";

  if (isSmall) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-white p-3 gap-1">
        <WeatherIcon code={w.icon} size="text-4xl" />
        <div className="text-3xl font-bold">{w.temp}{unit}</div>
        <div className="text-xs text-gray-400 text-center capitalize">{w.city}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black text-white p-6 justify-between">
      {/* Current */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-gray-400 text-sm uppercase tracking-widest mb-1">{w.city}</div>
          <div className={`font-bold leading-none ${isSmall ? "text-5xl" : "text-7xl"}`}>
            {w.temp}{unit}
          </div>
          <div className="text-gray-300 capitalize mt-2 text-lg">{w.description}</div>
          <div className="text-gray-500 text-sm mt-1">
            Feels {w.feelsLike}{unit} · H:{w.high}{unit} L:{w.low}{unit}
          </div>
        </div>
        <WeatherIcon code={w.icon} size="text-7xl" />
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm text-gray-400">
        <div>💧 {w.humidity}%</div>
        <div>💨 {w.windSpeed} {windUnit}</div>
      </div>

      {/* Forecast */}
      {w.forecast.length > 0 && (
        <div className="flex gap-3 border-t border-gray-800 pt-4">
          {w.forecast.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs text-gray-500 uppercase">{day.day}</div>
              <WeatherIcon code={day.icon} size="text-2xl" />
              <div className="text-sm font-semibold">{Math.round(day.high)}{unit}</div>
              <div className="text-xs text-gray-500">{Math.round(day.low)}{unit}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
