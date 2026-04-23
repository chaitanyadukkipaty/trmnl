"use client";

import { Component, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PluginMeta, PluginConfigField, SlotSize } from "@/widgets/types";
import { getPlugin } from "@/widgets/registry";

// Omit the non-serializable fetcher function (safe for client props)
type SerializablePlugin = Omit<PluginMeta, "fetcher"> & { hasFetcher?: boolean };

interface Props {
  plugins: SerializablePlugin[];
  initialData?: {
    id: string;
    pluginId: string;
    name: string;
    config: Record<string, unknown>;
    refreshIntervalMinutes: number;
  };
  initialCachedData?: unknown;
}

export function WidgetForm({ plugins, initialData, initialCachedData }: Props) {
  const router = useRouter();
  const [selectedPluginId, setSelectedPluginId] = useState(
    initialData?.pluginId ?? plugins[0]?.id ?? ""
  );
  const [name, setName] = useState(initialData?.name ?? "");
  const [config, setConfig] = useState<Record<string, unknown>>(
    initialData?.config ?? {}
  );
  const [refreshInterval, setRefreshInterval] = useState(
    initialData?.refreshIntervalMinutes ?? plugins[0]?.defaultRefreshMinutes ?? 30
  );
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);
  const [previewSlot, setPreviewSlot] = useState<SlotSize>("full");

  const selectedPlugin = plugins.find((p) => p.id === selectedPluginId);

  // Auto-fetch on first open when no cached data exists yet
  useEffect(() => {
    if (initialData && !initialCachedData && selectedPlugin?.hasFetcher) {
      handleRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePluginChange(id: string) {
    setSelectedPluginId(id);
    const plugin = plugins.find((p) => p.id === id);
    if (plugin) {
      setRefreshInterval(plugin.defaultRefreshMinutes);
      const defaults: Record<string, unknown> = {};
      for (const field of plugin.configFields) {
        if (field.defaultValue !== undefined) {
          defaults[field.key] = field.defaultValue;
        }
      }
      setConfig(defaults);
      if (!initialData) setName("");
    }
  }

  function handleConfigChange(key: string, value: unknown) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Widget name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = initialData
        ? `/api/widgets/${initialData.id}`
        : "/api/widgets";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pluginId: selectedPluginId,
          name: name.trim(),
          config,
          refreshIntervalMinutes: refreshInterval,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to save widget");
      }

      if (!initialData) {
        // New widget: go to edit page so we can fetch immediately
        const created = await res.json();
        router.push(`/admin/widgets/${created.id}`);
      } else {
        router.push("/admin/widgets");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleRefresh() {
    if (!initialData) return;
    setRefreshing(true);
    setRefreshMsg(null);
    setError(null);
    try {
      const res = await fetch(`/api/widgets/${initialData.id}/refresh`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Refresh failed");
      setRefreshMsg("Data refreshed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  const slotSizes: { label: string; value: SlotSize }[] = [
    { label: "Full", value: "full" },
    { label: "Half", value: "half" },
    { label: "Quarter", value: "quarter" },
  ];

  return (
    <div className="flex gap-8 items-start">
      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 min-w-0 max-w-lg space-y-6">
        {/* Plugin selector */}
        {!initialData && (
          <div>
            <label className="block text-sm font-medium mb-2">Plugin Type</label>
            <div className="grid grid-cols-2 gap-2">
              {plugins.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePluginChange(p.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedPluginId === p.id
                      ? "border-white bg-gray-800"
                      : "border-gray-700 hover:border-gray-500"
                  }`}
                >
                  <div className="text-xl mb-1">{p.icon}</div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Widget name */}
        <div>
          <label className="block text-sm font-medium mb-2">Widget Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`My ${selectedPlugin?.name ?? "Widget"}`}
            className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* Config fields */}
        {selectedPlugin && selectedPlugin.configFields.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Configuration
            </div>
            {selectedPlugin.configFields.map((field) => (
              <ConfigField
                key={field.key}
                field={field}
                value={config[field.key]}
                onChange={(val) => handleConfigChange(field.key, val)}
              />
            ))}
          </div>
        )}

        {/* Refresh interval */}
        {selectedPlugin?.hasFetcher && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Refresh Interval (minutes)
            </label>
            <input
              type="number"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              min={1}
              max={1440}
              className="w-32 px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-gray-400"
            />
          </div>
        )}

        {/* Webhook info */}
        {selectedPluginId === "webhook" && initialData && (
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-700">
            <div className="text-sm font-medium mb-2">Webhook Endpoint</div>
            <code className="text-xs text-green-400 break-all">
              POST {typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/{initialData.id}
            </code>
            <div className="text-xs text-gray-500 mt-2">
              Send a JSON payload to this URL to update the widget display
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2 flex-wrap">
          <button
            type="submit"
            disabled={saving || refreshing}
            className="px-5 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : initialData ? "Save Changes" : "Create Widget"}
          </button>
          {initialData && selectedPlugin?.hasFetcher && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || saving}
              className="px-5 py-2 rounded-md border border-gray-600 text-sm hover:border-gray-400 disabled:opacity-50 transition-colors"
            >
              {refreshing ? "Fetching…" : "Refresh Now"}
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push("/admin/widgets")}
            className="px-5 py-2 rounded-md border border-gray-700 text-sm hover:border-gray-500 transition-colors"
          >
            Cancel
          </button>
        </div>
        {refreshMsg && (
          <div className="text-green-400 text-sm">{refreshMsg}</div>
        )}
      </form>

      {/* Preview panel */}
      <div className="sticky top-8 w-[480px] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-400">
            {selectedPlugin?.icon} {selectedPlugin?.name ?? "Widget"} Preview
          </div>
          <div className="flex gap-1">
            {slotSizes.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPreviewSlot(value)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  previewSlot === value
                    ? "bg-gray-700 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div
          className="bg-black rounded-lg overflow-hidden border border-gray-800"
          style={{ width: 480, height: 360 }}
        >
          <PreviewErrorBoundary>
            <WidgetPreview
              pluginId={selectedPluginId}
              config={config}
              data={initialCachedData ?? null}
              slot={previewSlot}
            />
          </PreviewErrorBoundary>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {initialCachedData
            ? "Showing last fetched data"
            : "No data yet — preview shows layout only"}
        </p>
      </div>
    </div>
  );
}

function WidgetPreview({
  pluginId,
  config,
  data,
  slot,
}: {
  pluginId: string;
  config: Record<string, unknown>;
  data: unknown;
  slot: SlotSize;
}) {
  const plugin = getPlugin(pluginId);
  if (!plugin?.Renderer) {
    return (
      <div className="flex items-center justify-center h-full text-gray-700 text-sm">
        No renderer for this plugin
      </div>
    );
  }
  return (
    <div className="h-full w-full overflow-hidden">
      <plugin.Renderer config={config} data={data} slot={slot} />
    </div>
  );
}

class PreviewErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: { children: React.ReactNode }) {
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full text-red-900 text-xs p-4 text-center">
          Preview unavailable — fill in required config fields
        </div>
      );
    }
    return this.props.children;
  }
}

function ConfigField({
  field,
  value,
  onChange,
}: {
  field: PluginConfigField;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const inputClass =
    "w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-gray-400";

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {field.helpText && (
        <p className="text-xs text-gray-500 mb-1">{field.helpText}</p>
      )}

      {field.type === "textarea" ? (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={`${inputClass} font-mono text-xs resize-y`}
        />
      ) : field.type === "select" ? (
        <select
          value={(value as string) ?? (field.defaultValue as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === "boolean" ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={(value as boolean) ?? (field.defaultValue as boolean) ?? false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-400">Enabled</span>
        </label>
      ) : field.type === "password" ? (
        <input
          type="password"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={inputClass}
          autoComplete="off"
        />
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          value={(value as string | number) ?? ""}
          onChange={(e) =>
            onChange(field.type === "number" ? Number(e.target.value) : e.target.value)
          }
          placeholder={field.placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}
