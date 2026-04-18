"use client";

import { useState, useEffect } from "react";
import type { SlotSize } from "@/widgets/types";

interface ClockConfig {
  showDate?: boolean;
  showSeconds?: boolean;
  format24h?: boolean;
  timezone?: string;
}

interface Props {
  config: ClockConfig;
  data: unknown;
  slot: SlotSize;
}

function getNow(timezone?: string): Date {
  if (timezone) {
    try {
      const str = new Date().toLocaleString("en-US", { timeZone: timezone });
      return new Date(str);
    } catch {
      return new Date();
    }
  }
  return new Date();
}

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function ClockRenderer({ config, slot }: Props) {
  const [now, setNow] = useState(() => getNow(config.timezone));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(getNow(config.timezone));
    }, 1000);
    return () => clearInterval(interval);
  }, [config.timezone]);

  const showDate = config.showDate !== false;
  const showSeconds = config.showSeconds === true;
  const format24h = config.format24h === true;

  const hours = format24h ? now.getHours() : now.getHours() % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const ampm = !format24h ? (now.getHours() < 12 ? "AM" : "PM") : "";
  const hoursStr = String(hours).padStart(2, "0");

  const dayName = DAY_NAMES[now.getDay()];
  const monthName = MONTH_NAMES[now.getMonth()];
  const dayNum = now.getDate();
  const year = now.getFullYear();

  const isSmall = slot === "quarter";
  const isMedium = slot === "half";

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black text-white select-none">
      <div
        className={`font-mono font-bold tabular-nums leading-none ${
          isSmall ? "text-5xl" : isMedium ? "text-8xl" : "text-[10rem]"
        }`}
      >
        {hoursStr}:{minutes}
        {showSeconds && (
          <span className={isSmall ? "text-3xl" : isMedium ? "text-5xl" : "text-7xl"}>
            :{seconds}
          </span>
        )}
        {ampm && (
          <span
            className={`ml-2 ${
              isSmall ? "text-xl" : isMedium ? "text-3xl" : "text-5xl"
            } font-normal text-gray-400`}
          >
            {ampm}
          </span>
        )}
      </div>
      {showDate && (
        <div
          className={`mt-4 text-gray-300 font-light tracking-widest uppercase ${
            isSmall ? "text-xs" : isMedium ? "text-base" : "text-2xl"
          }`}
        >
          {dayName}, {monthName} {dayNum}, {year}
        </div>
      )}
    </div>
  );
}
