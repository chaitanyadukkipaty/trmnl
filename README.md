# TRMNL — iPad Always-On Display Dashboard

A [TRMNL](https://usetrmnl.com)-inspired always-on display dashboard built as a Next.js 15 PWA, optimized for iPad kiosk use. Rotate through widgets (clock, weather, RSS, custom HTML, webhooks) in configurable playlists — no hardware required.

![Display view showing a full-screen clock widget](.github/preview.png)

---

## Features

- **Playlist rotation** — create playlists with multiple layouts that auto-advance on a configurable timer
- **5 built-in widget plugins** — Clock, Weather, RSS, Custom HTML, Webhook
- **4 layout types** — Full screen, Half vertical, Half horizontal, Quadrant (2×2)
- **Admin dashboard** — full CRUD for widgets and playlists, drag-to-reorder playlist items
- **Webhook push** — external services can POST JSON to update a widget in real time
- **Night / dim mode** — auto-dim the screen on a schedule with tap-to-temporarily-brighten
- **PWA + Wake Lock** — install to iPad home screen, runs fullscreen; Wake Lock API prevents sleep
- **Stateless scheduling** — multiple iPads auto-sync to the same playlist position with no server state

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Database | SQLite via Drizzle ORM (`better-sqlite3`) |
| Styling | Tailwind CSS v4 |
| Drag-and-drop | @dnd-kit/core + @dnd-kit/sortable |
| Templating | Mustache (webhook widget) |
| PWA | Web App Manifest + Wake Lock API |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file:

```bash
# Required for the cron refresh endpoint
CRON_SECRET=your-random-secret-here

# Required only if you use the Weather widget
OPENWEATHERMAP_API_KEY=your-api-key-here
```

### 3. Set up the database

```bash
npx drizzle-kit migrate
```

This creates `trmnl.db` (SQLite) with all required tables.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/admin` to set things up.

---

## Usage

### Admin Dashboard — `/admin`

The admin panel has three sections:

#### Widgets — `/admin/widgets`

Create widget instances from available plugins. Each widget has:
- A **name** (displayed in admin lists)
- A **plugin type** (clock, weather, rss, custom-html, webhook)
- **Plugin-specific config** (API keys, URLs, templates, etc.)
- A **refresh interval** (how often the server re-fetches data)

#### Playlists — `/admin/playlists`

Create playlists and add items to them. Each playlist item has:
- A **layout type** (full / half-vertical / half-horizontal / quadrant)
- A **duration** in seconds (how long this item is shown)
- **Widget slot assignments** — which widget fills each slot in the layout

Drag items to reorder them. Click **Activate** to make a playlist the live display.

#### Settings — `/admin/settings`

- **Night mode** — enable auto-dim with a start time, end time, and brightness level
- **Cron info** — the URL to hit for automatic background widget refresh

---

## Widget Plugins

### Clock

No configuration needed. Displays the current time and date, updating every second. Font size adapts to slot size.

### Weather

Displays current conditions and a 3-day forecast.

| Field | Description |
|---|---|
| Latitude | Decimal latitude of your location |
| Longitude | Decimal longitude of your location |
| Units | `metric` (°C, m/s) or `imperial` (°F, mph) |
| API Key | [OpenWeatherMap](https://openweathermap.org/api) free-tier key |

Data is fetched server-side and cached; refresh interval is configurable.

### RSS

Displays headlines from any RSS feed URL.

| Field | Description |
|---|---|
| Feed URL | Full URL to an RSS/Atom feed |
| Max Items | Number of headlines to display (default 5) |

### Custom HTML

Renders arbitrary HTML in a sandboxed iframe. Useful for embedding simple dashboards, countdown timers, or anything you can write in HTML/CSS/JS.

| Field | Description |
|---|---|
| HTML Content | Full HTML document or fragment |

### Webhook

Receives JSON pushed from external services and renders it via a [Mustache](https://mustache.github.io) template.

| Field | Description |
|---|---|
| Template | Mustache HTML template. Variables from the JSON payload are available (e.g. `{{temperature}}`) |

**Endpoint:** `POST /api/webhooks/{widgetId}`

```bash
curl -X POST http://localhost:3000/api/webhooks/YOUR_WIDGET_ID \
  -H "Content-Type: application/json" \
  -d '{"temperature": "72°F", "status": "Sunny"}'
```

The widget updates immediately on the next display poll.

---

## Layout Types

| Layout | Slots | Use case |
|---|---|---|
| `full` | A (full screen) | Single focused widget |
| `half-vertical` | A (left), B (right) | Two side-by-side widgets |
| `half-horizontal` | A (top), B (bottom) | Two stacked widgets |
| `quadrant` | A (TL), B (TR), C (BL), D (BR) | Four widgets at once |

---

## Display View — `/display`

The display page is the kiosk view intended for the iPad. It:

- Polls `GET /api/display/current` every 5 seconds
- Advances to the next playlist item when its duration expires (CSS fade transition)
- Shows progress dots for multi-item playlists
- Requests Wake Lock to prevent the screen from sleeping
- Applies dim/night mode based on the schedule set in Settings
- Tap anywhere to temporarily undim (auto-re-dims after 30 seconds)

If no playlist is active, it shows a prompt linking to `/admin`.

---

## iPad Kiosk Setup

### Install as PWA

1. Open `http://<your-server-ip>:3000/display` in Safari on the iPad
2. Tap the **Share** button → **Add to Home Screen**
3. The app opens fullscreen with no browser chrome

### Prevent Sleep

Wake Lock API (iOS 16.4+) is used automatically. For older iOS, keep the screen awake via **Settings → Display & Brightness → Auto-Lock → Never**.

### Lock to Display (Guided Access)

1. **Settings → Accessibility → Guided Access** → turn on
2. Open the TRMNL PWA
3. Triple-click the side button → **Start**

The iPad is now locked to the display — no home button, no notifications.

---

## Background Widget Refresh (Cron)

Widgets with fetchers (weather, RSS) cache their data in the database. A cron job keeps the data fresh.

**Endpoint:** `GET /api/cron/refresh?secret=YOUR_CRON_SECRET`

Set up a cron job to call this endpoint every minute:

```bash
# crontab -e
* * * * * curl -s "http://localhost:3000/api/cron/refresh?secret=YOUR_CRON_SECRET"
```

Or use a hosted cron service (EasyCron, cron-job.org, Vercel Cron, etc.).

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/display/current` | Current playlist item + seconds until next |
| `GET` | `/api/widgets` | List all widget instances |
| `POST` | `/api/widgets` | Create a widget instance |
| `GET` | `/api/widgets/:id` | Get one widget |
| `PUT` | `/api/widgets/:id` | Update a widget |
| `DELETE` | `/api/widgets/:id` | Delete a widget |
| `POST` | `/api/widgets/:id/refresh` | Force-refresh a widget's data |
| `GET` | `/api/playlists` | List all playlists |
| `POST` | `/api/playlists` | Create a playlist |
| `PUT` | `/api/playlists/:id` | Update a playlist (set `isActive: true` to activate) |
| `DELETE` | `/api/playlists/:id` | Delete a playlist |
| `GET` | `/api/playlists/:id/items` | List items in a playlist |
| `POST` | `/api/playlists/:id/items` | Add an item to a playlist |
| `PUT` | `/api/playlists/:id/items/:itemId` | Update a playlist item |
| `DELETE` | `/api/playlists/:id/items/:itemId` | Remove a playlist item |
| `POST` | `/api/webhooks/:widgetId` | Push data to a webhook widget |
| `GET` | `/api/cron/refresh?secret=` | Refresh all stale widgets |
| `GET` | `/api/settings` | Get all settings |
| `PUT` | `/api/settings` | Update settings |

---

## Project Structure

```
trmnl/
├── app/
│   ├── admin/               # Admin dashboard pages
│   │   ├── widgets/         # Widget CRUD
│   │   ├── playlists/       # Playlist CRUD + drag editor
│   │   └── settings/        # Night mode + cron config
│   ├── api/                 # API routes
│   │   ├── display/current/ # Display polling endpoint
│   │   ├── widgets/         # Widget REST API
│   │   ├── playlists/       # Playlist REST API
│   │   ├── webhooks/        # Webhook push endpoint
│   │   └── cron/refresh/    # Background refresh trigger
│   └── display/             # iPad kiosk view
├── components/
│   └── display/             # PlaylistRunner, LayoutRenderer, WidgetSlot, layouts
├── db/
│   ├── schema.ts            # Drizzle schema (single source of truth)
│   ├── index.ts             # DB singleton
│   └── migrations/          # SQL migration files
├── hooks/
│   ├── usePlaylist.ts       # 5s polling hook
│   ├── useWakeLock.ts       # Wake Lock API hook
│   └── useDim.ts            # Night mode / dim logic
├── lib/
│   ├── playlist-scheduler.ts # Stateless wall-clock scheduling
│   └── widget-runner.ts      # Server-side fetch + cache logic
└── widgets/
    ├── types.ts             # Core TypeScript interfaces
    ├── server-plugins.ts    # Plugin metadata + fetchers (no React)
    ├── registry.ts          # Client registry with renderers
    ├── clock/
    ├── weather/
    ├── rss/
    ├── custom-html/
    └── webhook/
```

---

## Adding a New Widget Plugin

1. Create a directory under `widgets/your-plugin/`
2. Add `renderer.tsx` — a React component receiving `{ data, config, slot }`
3. Optionally add `fetcher.ts` — an async function that fetches and returns data
4. Register the plugin in `widgets/server-plugins.ts` (metadata + fetcher)
5. Add the renderer to `widgets/registry.ts`

The admin UI automatically generates a config form from the `configFields` array in your plugin definition — no additional UI code needed.

---

## License

MIT
