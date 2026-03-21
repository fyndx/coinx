PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_coinx_store` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_coinx_store`("id", "name", "location", "created_at", "updated_at", "sync_status", "deleted_at") SELECT "id", "name", "location", "created_at", "updated_at", "sync_status", "deleted_at" FROM `coinx_store`;--> statement-breakpoint
DROP TABLE `coinx_store`;--> statement-breakpoint
ALTER TABLE `__new_coinx_store` RENAME TO `coinx_store`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_store_name_location` ON `coinx_store` (`name`,`location`);--> statement-breakpoint
CREATE TABLE `__new_coinx_category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_coinx_category`("id", "name", "icon", "color", "type", "created_at", "updated_at", "sync_status", "deleted_at") SELECT "id", "name", "icon", "color", "type", "created_at", "updated_at", "sync_status", "deleted_at" FROM `coinx_category`;--> statement-breakpoint
DROP TABLE `coinx_category`;--> statement-breakpoint
ALTER TABLE `__new_coinx_category` RENAME TO `coinx_category`;--> statement-breakpoint
CREATE UNIQUE INDEX `coinx_category_name_unique` ON `coinx_category` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `coinx_category_icon_unique` ON `coinx_category` (`icon`);--> statement-breakpoint
CREATE UNIQUE INDEX `coinx_category_color_unique` ON `coinx_category` (`color`);--> statement-breakpoint
CREATE TABLE `__new_coinx_product_listing` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`store_id` text NOT NULL,
	`url` text,
	`price` real NOT NULL,
	`quantity` real NOT NULL,
	`unit` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`deleted_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `coinx_product`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `coinx_store`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_coinx_product_listing`("id", "product_id", "name", "store_id", "url", "price", "quantity", "unit", "created_at", "updated_at", "sync_status", "deleted_at") SELECT "id", "product_id", "name", "store_id", "url", "price", "quantity", "unit", "created_at", "updated_at", "sync_status", "deleted_at" FROM `coinx_product_listing`;--> statement-breakpoint
DROP TABLE `coinx_product_listing`;--> statement-breakpoint
ALTER TABLE `__new_coinx_product_listing` RENAME TO `coinx_product_listing`;--> statement-breakpoint
CREATE INDEX `idx_product_listings_product_id` ON `coinx_product_listing` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_product_listings_store_id` ON `coinx_product_listing` (`store_id`);--> statement-breakpoint
CREATE TABLE `__new_coinx_product_listing_history` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`product_listing_id` text NOT NULL,
	`price` real NOT NULL,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`deleted_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `coinx_product`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_listing_id`) REFERENCES `coinx_product_listing`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_coinx_product_listing_history`("id", "product_id", "product_listing_id", "price", "recorded_at", "updated_at", "sync_status", "deleted_at") SELECT "id", "product_id", "product_listing_id", "price", "recorded_at", "updated_at", "sync_status", "deleted_at" FROM `coinx_product_listing_history`;--> statement-breakpoint
DROP TABLE `coinx_product_listing_history`;--> statement-breakpoint
ALTER TABLE `__new_coinx_product_listing_history` RENAME TO `coinx_product_listing_history`;--> statement-breakpoint
CREATE INDEX `idx_product_listings_history_product_id` ON `coinx_product_listing_history` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_product_listings_history_product_listing_id` ON `coinx_product_listing_history` (`product_listing_id`);--> statement-breakpoint
CREATE INDEX `idx_product_listings_history_recorded_at` ON `coinx_product_listing_history` (`recorded_at`);--> statement-breakpoint
CREATE TABLE `__new_coinx_product` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`notes` text,
	`default_unit_category` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_coinx_product`("id", "name", "image", "notes", "default_unit_category", "created_at", "updated_at", "sync_status", "deleted_at") SELECT "id", "name", "image", "notes", "default_unit_category", "created_at", "updated_at", "sync_status", "deleted_at" FROM `coinx_product`;--> statement-breakpoint
DROP TABLE `coinx_product`;--> statement-breakpoint
ALTER TABLE `__new_coinx_product` RENAME TO `coinx_product`;--> statement-breakpoint
CREATE TABLE `__new_coinx_transaction` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_time` text NOT NULL,
	`amount` real NOT NULL,
	`note` text,
	`transaction_type` text NOT NULL,
	`category_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`deleted_at` text,
	FOREIGN KEY (`category_id`) REFERENCES `coinx_category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_coinx_transaction`("id", "transaction_time", "amount", "note", "transaction_type", "category_id", "created_at", "updated_at", "sync_status", "deleted_at") SELECT "id", "transaction_time", "amount", "note", "transaction_type", "category_id", "created_at", "updated_at", "sync_status", "deleted_at" FROM `coinx_transaction`;--> statement-breakpoint
DROP TABLE `coinx_transaction`;--> statement-breakpoint
ALTER TABLE `__new_coinx_transaction` RENAME TO `coinx_transaction`;