import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard Admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <Link href="/admin" className="text-lg font-bold tracking-tight">
            📺 Dashboard
          </Link>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          <NavLink href="/admin" exact>
            Overview
          </NavLink>
          <div className="text-xs text-gray-600 uppercase tracking-widest px-3 pt-4 pb-1">
            Content
          </div>
          <NavLink href="/admin/playlists">Playlists</NavLink>
          <NavLink href="/admin/widgets">Widgets</NavLink>
          <div className="text-xs text-gray-600 uppercase tracking-widest px-3 pt-4 pb-1">
            System
          </div>
          <NavLink href="/admin/settings">Settings</NavLink>
        </nav>
        <div className="p-3 border-t border-gray-800">
          <Link
            href="/display"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <span>↗</span> Open Display
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  children,
  exact,
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  // Note: active state handled client-side; server renders basic link
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
    >
      {children}
    </Link>
  );
}
