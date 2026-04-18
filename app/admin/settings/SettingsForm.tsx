"use client";

import { useState } from "react";

interface NightMode {
  enabled: boolean;
  dimFrom: string;
  dimTo: string;
  dimBrightness: number;
}

interface Props {
  nightMode: NightMode;
  cronSecret: string;
}

export function SettingsForm({ nightMode: initialNightMode, cronSecret }: Props) {
  const [nightMode, setNightMode] = useState(initialNightMode);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ night_mode: nightMode }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputClass =
    "px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-gray-400";

  return (
    <div className="space-y-8">
      {/* Night mode */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Night / Dim Mode
        </h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={nightMode.enabled}
              onChange={(e) =>
                setNightMode((n) => ({ ...n, enabled: e.target.checked }))
              }
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Enable automatic dim at night</span>
          </label>

          {nightMode.enabled && (
            <div className="pl-7 space-y-3">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Dim From</label>
                  <input
                    type="time"
                    value={nightMode.dimFrom}
                    onChange={(e) =>
                      setNightMode((n) => ({ ...n, dimFrom: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Dim Until</label>
                  <input
                    type="time"
                    value={nightMode.dimTo}
                    onChange={(e) =>
                      setNightMode((n) => ({ ...n, dimTo: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Brightness during night: {Math.round(nightMode.dimBrightness * 100)}%
                </label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={Math.round(nightMode.dimBrightness * 100)}
                  onChange={(e) =>
                    setNightMode((n) => ({
                      ...n,
                      dimBrightness: Number(e.target.value) / 100,
                    }))
                  }
                  className="w-48"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Cron info */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Data Refresh (Cron)
        </h2>
        <div className="p-4 rounded-lg bg-gray-900 border border-gray-700 text-sm">
          <p className="text-gray-400 mb-3">
            To automatically refresh widget data, set up a cron job to call:
          </p>
          <code className="text-green-400 text-xs break-all block mb-2">
            GET {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/cron/refresh?secret={cronSecret}
          </code>
          <p className="text-gray-600 text-xs">
            Recommended: every 1 minute. Widgets only refresh when their interval has elapsed.
          </p>
        </div>
      </section>

      {/* iPad setup guide */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
          iPad Setup
        </h2>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            <span className="text-white font-medium">Install as PWA:</span> Open{" "}
            <code className="text-green-400">/display</code> in Safari on your iPad →
            tap the Share button → "Add to Home Screen"
          </p>
          <p>
            <span className="text-white font-medium">Always-On Kiosk:</span> Go to
            Settings → Accessibility → Guided Access, enable it, then triple-click
            the Home/Side button when the display is open
          </p>
          <p>
            <span className="text-white font-medium">Screen Sleep:</span> The display
            uses the Wake Lock API (iOS 16.4+) to prevent the screen from sleeping
          </p>
        </div>
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Settings"}
      </button>
    </div>
  );
}
