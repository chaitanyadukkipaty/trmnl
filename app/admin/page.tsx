import { db } from "@/db";
import { playlists, widgetInstances, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function AdminOverview() {
  const [allPlaylists, allWidgets, settingsRows] = await Promise.all([
    db.select().from(playlists),
    db.select().from(widgetInstances),
    db.select().from(settings),
  ]);

  const settingsMap: Record<string, unknown> = {};
  for (const row of settingsRows) {
    settingsMap[row.key] = row.value;
  }

  const activePl = allPlaylists.find(
    (p) => p.id === settingsMap["active_playlist_id"]
  );

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Overview</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Manage your always-on iPad display
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Playlists" value={allPlaylists.length} href="/admin/playlists" />
        <StatCard label="Widgets" value={allWidgets.length} href="/admin/widgets" />
        <StatCard
          label="Active Playlist"
          value={activePl?.name ?? "None"}
          href="/admin/playlists"
          small
        />
      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Quick Actions
      </h2>
      <div className="flex flex-wrap gap-3">
        <ActionButton href="/admin/widgets/new">+ Add Widget</ActionButton>
        <ActionButton href="/admin/playlists/new">+ New Playlist</ActionButton>
        <ActionButton href="/display" target="_blank">
          ↗ Open Display
        </ActionButton>
      </div>

      {/* Setup guide */}
      {allWidgets.length === 0 && (
        <div className="mt-8 p-5 border border-gray-700 rounded-lg bg-gray-900">
          <h3 className="font-semibold mb-2">Getting Started</h3>
          <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
            <li>
              <Link href="/admin/widgets/new" className="text-white underline">
                Create a widget
              </Link>{" "}
              (try Clock first)
            </li>
            <li>
              <Link href="/admin/playlists/new" className="text-white underline">
                Create a playlist
              </Link>{" "}
              and add your widget to it
            </li>
            <li>Activate the playlist from the playlist edit page</li>
            <li>
              Open{" "}
              <Link href="/display" target="_blank" className="text-white underline">
                /display
              </Link>{" "}
              on your iPad
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  small,
}: {
  label: string;
  value: string | number;
  href: string;
  small?: boolean;
}) {
  return (
    <Link
      href={href}
      className="p-4 rounded-lg border border-gray-800 bg-gray-900 hover:border-gray-600 transition-colors"
    >
      <div className={`font-bold ${small ? "text-lg" : "text-3xl"}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{label}</div>
    </Link>
  );
}

function ActionButton({
  href,
  target,
  children,
}: {
  href: string;
  target?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target={target}
      className="px-4 py-2 rounded-md border border-gray-700 text-sm hover:border-gray-500 hover:bg-gray-800 transition-colors"
    >
      {children}
    </Link>
  );
}
