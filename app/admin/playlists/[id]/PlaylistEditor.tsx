"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";

interface WidgetOption {
  id: string;
  name: string;
  pluginId: string;
  icon: string;
}

interface PlaylistItemData {
  id: string;
  position: number;
  layoutType: string;
  durationSeconds: number;
  slotA: string | null;
  slotB: string | null;
  slotC: string | null;
  slotD: string | null;
}

interface Props {
  playlistId: string;
  playlistName: string;
  initialItems: PlaylistItemData[];
  widgets: WidgetOption[];
  isActive: boolean;
}

const LAYOUT_OPTIONS = [
  { value: "full", label: "Full Screen", slots: 1 },
  { value: "half-vertical", label: "Half Vertical (L/R)", slots: 2 },
  { value: "half-horizontal", label: "Half Horizontal (T/B)", slots: 2 },
  { value: "quadrant", label: "Quadrant (2×2)", slots: 4 },
];

export function PlaylistEditor({
  playlistId,
  playlistName,
  initialItems,
  widgets,
  isActive,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState<PlaylistItemData[]>(initialItems);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(playlistName);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        position: idx,
      }));
      setItems(reordered);
    }
  }

  async function addItem() {
    const res = await fetch(`/api/playlists/${playlistId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layoutType: "full", durationSeconds: 30 }),
    });
    const item = await res.json();
    setItems((prev) => [...prev, item]);
  }

  async function removeItem(id: string) {
    await fetch(`/api/playlists/${playlistId}/items/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, changes: Partial<PlaylistItemData>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
    );
  }

  async function saveAll() {
    setSaving(true);
    try {
      // Save name
      await fetch(`/api/playlists/${playlistId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      // Save all items
      await Promise.all(
        items.map((item) =>
          fetch(`/api/playlists/${playlistId}/items/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              position: item.position,
              layoutType: item.layoutType,
              durationSeconds: item.durationSeconds,
              slotA: item.slotA,
              slotB: item.slotB,
              slotC: item.slotC,
              slotD: item.slotD,
            }),
          })
        )
      );

      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function activate() {
    await fetch(`/api/playlists/${playlistId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Playlist name */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-xl font-bold bg-transparent border-b border-gray-700 focus:border-gray-400 focus:outline-none px-1 py-0.5 flex-1"
        />
        {isActive ? (
          <span className="text-xs px-2 py-1 rounded-full bg-green-800 text-green-300">
            Active
          </span>
        ) : (
          <button
            onClick={activate}
            className="px-3 py-1.5 rounded border border-green-800 text-xs text-green-400 hover:bg-green-950 transition-colors"
          >
            Activate
          </button>
        )}
      </div>

      {/* Items */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                widgets={widgets}
                onUpdate={(changes) => updateItem(item.id, changes)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <div className="text-center py-12 border border-dashed border-gray-700 rounded-lg text-gray-600">
          No items yet. Add your first slide below.
        </div>
      )}

      <button
        onClick={addItem}
        className="w-full py-2 rounded-md border border-dashed border-gray-700 text-sm text-gray-500 hover:border-gray-500 hover:text-gray-400 transition-colors"
      >
        + Add Slide
      </button>

      {/* Save */}
      <div className="flex gap-3 pt-4 border-t border-gray-800">
        <button
          onClick={saveAll}
          disabled={saving}
          className="px-5 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button
          onClick={() => router.push("/admin/playlists")}
          className="px-5 py-2 rounded-md border border-gray-700 text-sm hover:border-gray-500 transition-colors"
        >
          Back
        </button>
        <a
          href="/display"
          target="_blank"
          className="ml-auto px-4 py-2 rounded-md border border-gray-700 text-sm text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
        >
          ↗ Preview Display
        </a>
      </div>
    </div>
  );
}

function SortableItem({
  item,
  widgets,
  onUpdate,
  onRemove,
}: {
  item: PlaylistItemData;
  widgets: WidgetOption[];
  onUpdate: (changes: Partial<PlaylistItemData>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const layout = LAYOUT_OPTIONS.find((l) => l.value === item.layoutType);
  const slotCount = layout?.slots ?? 1;

  const inputClass =
    "px-2 py-1 rounded bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:border-gray-500";

  const slotLabels = ["A (top-left)", "B (top-right)", "C (bottom-left)", "D (bottom-right)"];
  const slotKeys = ["slotA", "slotB", "slotC", "slotD"] as const;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 rounded-lg border border-gray-700 bg-gray-900"
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing"
        >
          ⠿
        </button>

        <div className="flex-1 space-y-3">
          {/* Layout + duration */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={item.layoutType}
              onChange={(e) => onUpdate({ layoutType: e.target.value })}
              className={inputClass}
            >
              {LAYOUT_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Duration</label>
              <input
                type="number"
                value={item.durationSeconds}
                onChange={(e) => onUpdate({ durationSeconds: Number(e.target.value) })}
                min={5}
                max={3600}
                className={`${inputClass} w-20`}
              />
              <span className="text-xs text-gray-500">sec</span>
            </div>
          </div>

          {/* Slot assignments */}
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: slotCount }).map((_, i) => {
              const key = slotKeys[i];
              const label =
                slotCount === 1
                  ? "Widget"
                  : slotCount === 2
                  ? i === 0 ? "Slot A (Left/Top)" : "Slot B (Right/Bottom)"
                  : `Slot ${slotLabels[i]}`;

              return (
                <div key={key}>
                  <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                  <select
                    value={item[key] ?? ""}
                    onChange={(e) => onUpdate({ [key]: e.target.value || null })}
                    className={`${inputClass} w-full`}
                  >
                    <option value="">— Empty —</option>
                    {widgets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.icon} {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onRemove}
          className="text-gray-600 hover:text-red-500 transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
