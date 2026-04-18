CREATE TABLE `playlist_items` (
	`id` text PRIMARY KEY NOT NULL,
	`playlist_id` text NOT NULL,
	`position` integer NOT NULL,
	`layout_type` text DEFAULT 'full' NOT NULL,
	`duration_seconds` integer DEFAULT 30 NOT NULL,
	`slot_a` text,
	`slot_b` text,
	`slot_c` text,
	`slot_d` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`slot_a`) REFERENCES `widget_instances`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`slot_b`) REFERENCES `widget_instances`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`slot_c`) REFERENCES `widget_instances`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`slot_d`) REFERENCES `widget_instances`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `webhook_payloads` (
	`id` text PRIMARY KEY NOT NULL,
	`widget_instance_id` text NOT NULL,
	`payload` text NOT NULL,
	`received_at` integer NOT NULL,
	FOREIGN KEY (`widget_instance_id`) REFERENCES `widget_instances`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `widget_instances` (
	`id` text PRIMARY KEY NOT NULL,
	`plugin_id` text NOT NULL,
	`name` text NOT NULL,
	`config` text,
	`cached_data` text,
	`last_fetched_at` integer,
	`refresh_interval_minutes` integer DEFAULT 30 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
