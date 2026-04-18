# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # start dev server (localhost:3000)
npm run build        # production build (runs TypeScript check)
npm run db:generate  # generate a new migration after schema changes
npm run db:migrate   # apply pending migrations to trmnl.db
npm run db:studio    # open Drizzle Studio (visual DB browser)
```

There are no tests. TypeScript errors are caught by `npm run build`.

## Environment Variables

```bash
CRON_SECRET=          # required for GET /api/cron/refresh?secret=
OPENWEATHERMAP_API_KEY=  # required for weather widget (can also be stored per-widget in config)
DATABASE_URL=         # defaults to file:./trmnl.db
```

## Architecture

This is a Next.js 15 App Router app with two main surfaces:

- `/display` — fullscreen iPad kiosk view (read-only, polls every 5 s)
- `/admin` — management dashboard (widget + playlist CRUD)

### Plugin / Widget System

The plugin registry is split into two files to respect the React server/client boundary:

- **`widgets/server-plugins.ts`** — plain objects: metadata + optional async `fetcher`. No React. Safe to import in API routes and server components.
- **`widgets/registry.ts`** (`'use client'`) — combines server-plugins with React renderer components. Only import this in client components.

When passing plugins to a client component from a server component, strip the `fetcher` function first (it is not serializable). See `app/admin/widgets/new/page.tsx` for the pattern:

```ts
const plugins = serverPlugins.map(({ fetcher, ...meta }) => ({ ...meta, hasFetcher: !!fetcher }));
```

### Data Flow

1. **Pull widgets** (weather, RSS): `GET /api/cron/refresh?secret=` calls `lib/widget-runner.ts → refreshStaleWidgets()`, which checks `lastFetchedAt + refreshIntervalMinutes` against wall clock, runs `plugin.fetcher(config)`, and stores the result in `widgetInstances.cachedData`.

2. **Push widgets** (webhook): `POST /api/webhooks/[widgetId]` stores the payload and updates `cachedData` immediately.

3. **Display**: `PlaylistRunner.tsx` polls `GET /api/display/current` every 5 s. That endpoint reads the active playlist from the `settings` table, resolves all widget instances in all slots, runs the stateless scheduler, and returns a `DisplayState`.

### Stateless Playlist Scheduling (`lib/playlist-scheduler.ts`)

```
elapsedSeconds = (Date.now() / 1000) % totalPlaylistDuration
```

The current item is whichever item's cumulative duration window contains `elapsedSeconds`. No server-side session state. Multiple iPads stay in sync automatically.

### Database (`db/schema.ts`)

Five tables:
- `widget_instances` — one row per created widget; `config` and `cached_data` are JSON columns.
- `playlists` + `playlist_items` — a playlist has ordered items; each item has a `layout_type` and up to four slot FKs (`slot_a`–`slot_d`) pointing to `widget_instances`.
- `webhook_payloads` — log of raw POSTed payloads.
- `settings` — key/value store. `active_playlist_id` is the only key used at runtime.

After modifying `db/schema.ts` always run `npm run db:generate` then `npm run db:migrate`.

### Layout Types

Each `playlist_items` row has a `layout_type`:

| Value | Slots used | Grid |
|---|---|---|
| `full` | A | 1×1 |
| `half-vertical` | A, B | 2 cols |
| `half-horizontal` | A, B | 2 rows |
| `quadrant` | A, B, C, D | 2×2 |

`WidgetSlot.tsx` maps slot position → `SlotSize` prop (`full` / `half` / `quarter`) which renderers use to scale their typography.

### Adding a New Plugin

1. Create `widgets/<name>/renderer.tsx` — a React component accepting `{ config, data, slot: SlotSize }`.
2. Optionally create `widgets/<name>/fetcher.ts` — an async function `(config: Record<string, unknown>) => Promise<unknown>`.
3. Add an entry to the `serverPlugins` array in `widgets/server-plugins.ts`.
4. Import and register the renderer in `widgets/registry.ts`.

The admin config form is auto-generated from the `configFields` array — no additional UI code needed.
