"use client";

import { useRouter } from "next/navigation";

export function ActivatePlaylistButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleActivate() {
    await fetch(`/api/playlists/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    router.refresh();
  }

  return (
    <button
      onClick={handleActivate}
      className="px-3 py-1.5 rounded border border-green-800 text-xs text-green-400 hover:bg-green-950 transition-colors"
    >
      Activate
    </button>
  );
}
