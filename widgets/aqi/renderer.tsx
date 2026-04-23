"use client";

import type { SlotSize } from "@/widgets/types";
import type { AqiData } from "./fetcher";

interface Props {
  config: Record<string, unknown>;
  data: unknown;
  slot: SlotSize;
}

function aqiColor(aqi: number) {
  if (aqi <= 50) return { text: "#22c55e", bg: "rgba(34,197,94,0.15)", border: "#16a34a" };
  if (aqi <= 100) return { text: "#eab308", bg: "rgba(234,179,8,0.15)", border: "#ca8a04" };
  if (aqi <= 150) return { text: "#f97316", bg: "rgba(249,115,22,0.15)", border: "#ea580c" };
  if (aqi <= 200) return { text: "#ef4444", bg: "rgba(239,68,68,0.15)", border: "#dc2626" };
  if (aqi <= 300) return { text: "#a855f7", bg: "rgba(168,85,247,0.15)", border: "#9333ea" };
  return { text: "#991b1b", bg: "rgba(153,27,27,0.2)", border: "#7f1d1d" };
}

const AQI_SEGMENTS = [
  { max: 50, label: "Good", color: "#22c55e" },
  { max: 100, label: "Moderate", color: "#eab308" },
  { max: 150, label: "Poor", color: "#f97316" },
  { max: 200, label: "Unhealthy", color: "#ef4444" },
  { max: 300, label: "Severe", color: "#a855f7" },
  { max: 500, label: "Hazardous", color: "#7f1d1d" },
];

function AqiBar({ aqi }: { aqi: number }) {
  const pct = Math.min((aqi / 300) * 100, 100);
  return (
    <div className="w-full">
      <div className="relative h-3 rounded-full overflow-hidden flex">
        {AQI_SEGMENTS.map((seg) => (
          <div
            key={seg.label}
            style={{ backgroundColor: seg.color, flex: seg.max <= 300 ? seg.max - (AQI_SEGMENTS[AQI_SEGMENTS.indexOf(seg) - 1]?.max ?? 0) : 200 }}
          />
        ))}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-gray-600 mt-1">
        <span>0</span>
        <span>50</span>
        <span>100</span>
        <span>150</span>
        <span>200</span>
        <span>300+</span>
      </div>
    </div>
  );
}

function Stat({ label, value, unit, large = false }: { label: string; value: number | null; unit: string; large?: boolean }) {
  if (value === null) return null;
  return (
    <div className="bg-gray-900 rounded-lg h-full flex flex-col items-center justify-center text-center gap-1 p-3">
      <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`font-bold text-white leading-none ${large ? "text-4xl" : "text-2xl"}`}>
        {value}
      </div>
      <div className="text-xs text-gray-500">{unit}</div>
    </div>
  );
}

function PollutantRow({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  if (value === null) return null;
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-white">
        {value} <span className="text-xs text-gray-500">{unit}</span>
      </span>
    </div>
  );
}

export function AqiRenderer({ data, slot }: Props) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-gray-500 text-sm text-center px-4">
        No AQI data yet. Add AQICN token and city to fetch data.
      </div>
    );
  }

  const d = data as AqiData;
  const colors = aqiColor(d.aqi);
  const cityShort = d.city.split(",")[0].trim();

  if (slot === "quarter") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-white p-3 gap-1">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest">AQI · {cityShort}</div>
        <div className="text-5xl font-bold leading-none" style={{ color: colors.text }}>
          {d.aqi}
        </div>
        <div className="text-xs font-medium" style={{ color: colors.text }}>
          {d.categoryShort}
        </div>
        {d.pm25 !== null && (
          <div className="text-[10px] text-gray-500 mt-1">PM2.5 · {d.pm25} μg/m³</div>
        )}
      </div>
    );
  }

  if (slot === "half") {
    return (
      <div className="flex flex-col h-full bg-black text-white p-5 gap-3">
        <div>
          <div className="text-gray-400 text-xs uppercase tracking-widest">{d.city}</div>
          <div className="flex items-end gap-3 mt-1">
            <div className="text-6xl font-bold leading-none" style={{ color: colors.text }}>
              {d.aqi}
            </div>
            <div className="pb-1">
              <div className="text-[10px] text-gray-500">AQI (US)</div>
              <div className="text-base font-semibold" style={{ color: colors.text }}>
                {d.categoryShort}
              </div>
            </div>
            {d.temp !== null && (
              <div className="ml-auto text-right pb-1">
                <div className="text-2xl font-bold">{d.temp}°C</div>
                {d.humidity !== null && (
                  <div className="text-xs text-gray-500">💧 {d.humidity}%</div>
                )}
              </div>
            )}
          </div>
        </div>

        <AqiBar aqi={d.aqi} />

        <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
          <Stat label="PM2.5" value={d.pm25} unit="μg/m³" large />
          <Stat label="PM10" value={d.pm10} unit="μg/m³" large />
          <Stat label="CO" value={d.co} unit="ppm" large />
          <Stat label="NO₂" value={d.no2} unit="ppb" large />
        </div>

        <div className="text-[10px] text-gray-700">
          Updated {new Date(d.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    );
  }

  // full slot
  return (
    <div className="flex flex-col h-full bg-black text-white p-6 gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.text }} />
            <span className="text-gray-400 text-sm uppercase tracking-widest">Live AQI</span>
          </div>
          <div className="flex items-end gap-4">
            <div className="text-8xl font-bold leading-none" style={{ color: colors.text }}>
              {d.aqi}
            </div>
            <div className="pb-2">
              <div className="text-gray-500 text-xs">AQI (US)</div>
              <div
                className="text-lg font-semibold px-3 py-0.5 rounded-full border"
                style={{ color: colors.text, backgroundColor: colors.bg, borderColor: colors.border }}
              >
                {d.category}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-1">{d.city}</div>
        </div>

        {d.temp !== null && (
          <div className="bg-gray-900 rounded-xl p-4 text-right min-w-[130px]">
            <div className="text-3xl font-bold">{d.temp}°C</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-xs text-gray-400">
              {d.humidity !== null && (
                <>
                  <span className="text-right">Humidity</span>
                  <span className="text-white font-medium">{d.humidity}%</span>
                </>
              )}
              {d.wind !== null && (
                <>
                  <span className="text-right">Wind</span>
                  <span className="text-white font-medium">{d.wind} m/s</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AQI bar */}
      <AqiBar aqi={d.aqi} />

      {/* Primary pollutants */}
      <div className="grid grid-cols-2 gap-3 h-24">
        <Stat label="PM2.5" value={d.pm25} unit="μg/m³" />
        <Stat label="PM10" value={d.pm10} unit="μg/m³" />
      </div>

      {/* Secondary pollutants */}
      <div className="bg-gray-900 rounded-lg px-4 py-2">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Major Pollutants</div>
        <PollutantRow label="Carbon Monoxide (CO)" value={d.co} unit="ppm" />
        <PollutantRow label="Sulfur Dioxide (SO₂)" value={d.so2} unit="ppb" />
        <PollutantRow label="Nitrogen Dioxide (NO₂)" value={d.no2} unit="ppb" />
        <PollutantRow label="Ozone (O₃)" value={d.o3} unit="ppb" />
      </div>

      <div className="text-[10px] text-gray-700 mt-auto">
        Updated {new Date(d.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
}
