"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPlaylistPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const playlist = await res.json();
    router.push(`/admin/playlists/${playlist.id}`);
  }

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-1">New Playlist</h1>
      <p className="text-gray-500 text-sm mb-8">Give your playlist a name</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Dashboard"
          autoFocus
          className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-gray-400"
        />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="px-5 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {saving ? "Creating…" : "Create Playlist"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/playlists")}
            className="px-5 py-2 rounded-md border border-gray-700 text-sm hover:border-gray-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
