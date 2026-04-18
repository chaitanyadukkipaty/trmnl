"use client";

import { useRouter } from "next/navigation";

export function DeleteWidgetButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete widget "${name}"? It will be removed from all playlists.`)) return;
    await fetch(`/api/widgets/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1.5 rounded border border-red-900 text-xs text-red-500 hover:bg-red-950 transition-colors"
    >
      Delete
    </button>
  );
}
