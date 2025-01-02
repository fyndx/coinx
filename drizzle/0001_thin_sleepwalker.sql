CREATE TABLE `coinx_store` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`location` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coinx_store_name_unique` ON `coinx_store` (`name`);--> statement-breakpoint
ALTER TABLE `coinx_product_listing` ADD `store_id` integer NOT NULL REFERENCES coinx_store(id);--> statement-breakpoint
ALTER TABLE `coinx_product_listing` DROP COLUMN `store`;--> statement-breakpoint
ALTER TABLE `coinx_product_listing` DROP COLUMN `location`;