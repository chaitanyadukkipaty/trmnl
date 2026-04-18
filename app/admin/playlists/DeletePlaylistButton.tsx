"use client";

import { useRouter } from "next/navigation";

export function DeletePlaylistButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete playlist "${name}"?`)) return;
    await fetch(`/api/playlists/${id}`, { method: "DELETE" });
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
