import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

function newId() {
  return crypto.randomUUID();
}

export const widgetInstances = sqliteTable("widget_instances", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => newId()),
  pluginId: text("plugin_id").notNull(),
  name: text("name").notNull(),
  config: text("config", { mode: "json" }).$type<Record<string, unknown>>(),
  cachedData: text("cached_data", { mode: "json" }).$type<unknown>(),
  lastFetchedAt: integer("last_fetched_at", { mode: "timestamp" }),
  refreshIntervalMinutes: integer("refresh_interval_minutes")
    .notNull()
    .default(30),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const playlists = sqliteTable("playlists", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => newId()),
  name: text("name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const playlistItems = sqliteTable("playlist_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => newId()),
  playlistId: text("playlist_id")
    .notNull()
    .references(() => playlists.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  layoutType: text("layout_type").notNull().default("full"),
  durationSeconds: integer("duration_seconds").notNull().default(30),
  slotA: text("slot_a").references(() => widgetInstances.id, {
    onDelete: "set null",
  }),
  slotB: text("slot_b").references(() => widgetInstances.id, {
    onDelete: "set null",
  }),
  slotC: text("slot_c").references(() => widgetInstances.id, {
    onDelete: "set null",
  }),
  slotD: text("slot_d").references(() => widgetInstances.id, {
    onDelete: "set null",
  }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const webhookPayloads = sqliteTable("webhook_payloads", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => newId()),
  widgetInstanceId: text("widget_instance_id")
    .notNull()
    .references(() => widgetInstances.id, { onDelete: "cascade" }),
  payload: text("payload", { mode: "json" }).notNull(),
  receivedAt: integer("received_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull().$type<unknown>(),
});

export type WidgetInstance = typeof widgetInstances.$inferSelect;
export type NewWidgetInstance = typeof widgetInstances.$inferInsert;
export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;
export type PlaylistItem = typeof playlistItems.$inferSelect;
export type NewPlaylistItem = typeof playlistItems.$inferInsert;
