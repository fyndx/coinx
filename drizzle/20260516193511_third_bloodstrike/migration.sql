CREATE TABLE `coinx_category` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`deleted_at` text,
	`local_owner_id` text
);
--> statement-breakpoint
CREATE TABLE `coinx_product_listing` (
	`id` text PRIMARY KEY,
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
	`local_owner_id` text,
	CONSTRAINT `fk_coinx_product_listing_product_id_coinx_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `coinx_product`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_coinx_product_listing_store_id_coinx_store_id_fk` FOREIGN KEY (`store_id`) REFERENCES `coinx_store`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `coinx_product_listing_history` (
	`id` text PRIMARY KEY,
	`product_id` text NOT NULL,
	`product_listing_id` text NOT NULL,
	`price` real NOT NULL,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`deleted_at` text,
	`local_owner_id` text,
	CONSTRAINT `fk_coinx_product_listing_history_product_id_coinx_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `coinx_product`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_coinx_product_listing_history_product_listing_id_coinx_product_listing_id_fk` FOREIGN KEY (`product_listing_id`) REFERENCES `coinx_product_listing`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `coinx_product` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`image` text,
	`notes` text,
	`default_unit_category` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`deleted_at` text,
	`local_owner_id` text
);
--> statement-breakpoint
CREATE TABLE `coinx_store` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`location` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`deleted_at` text,
	`local_owner_id` text
);
--> statement-breakpoint
CREATE TABLE `coinx_transaction` (
	`id` text PRIMARY KEY,
	`transaction_time` text NOT NULL,
	`amount` real NOT NULL,
	`note` text,
	`transaction_type` text NOT NULL,
	`category_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`deleted_at` text,
	`local_owner_id` text,
	CONSTRAINT `fk_coinx_transaction_category_id_coinx_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `coinx_category`(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_product_listings_product_id` ON `coinx_product_listing` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_product_listings_store_id` ON `coinx_product_listing` (`store_id`);--> statement-breakpoint
CREATE INDEX `idx_product_listings_history_product_id` ON `coinx_product_listing_history` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_product_listings_history_product_listing_id` ON `coinx_product_listing_history` (`product_listing_id`);--> statement-breakpoint
CREATE INDEX `idx_product_listings_history_recorded_at` ON `coinx_product_listing_history` (`recorded_at`);