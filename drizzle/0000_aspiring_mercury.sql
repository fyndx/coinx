CREATE TABLE `coinx_category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coinx_category_name_unique` ON `coinx_category` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `coinx_category_icon_unique` ON `coinx_category` (`icon`);--> statement-breakpoint
CREATE UNIQUE INDEX `coinx_category_color_unique` ON `coinx_category` (`color`);--> statement-breakpoint
CREATE TABLE `coinx_product_listing` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`name` text NOT NULL,
	`store` text NOT NULL,
	`url` text,
	`location` text,
	`price` integer NOT NULL,
	`quantity` real NOT NULL,
	`unit` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `coinx_product`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `coinx_product_listing_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`product_listing_id` integer NOT NULL,
	`price` integer NOT NULL,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `coinx_product`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_listing_id`) REFERENCES `coinx_product_listing`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_product_listings_history_product_id` ON `coinx_product_listing_history` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_product_listings_history_product_listing_id` ON `coinx_product_listing_history` (`product_listing_id`);--> statement-breakpoint
CREATE INDEX `idx_product_listings_history_recorded_at` ON `coinx_product_listing_history` (`recorded_at`);--> statement-breakpoint
CREATE TABLE `coinx_product` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`default_unit_category` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `coinx_transaction` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transaction_time` integer NOT NULL,
	`amount` real NOT NULL,
	`note` text,
	`transaction_type` text NOT NULL,
	`category_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text
);
