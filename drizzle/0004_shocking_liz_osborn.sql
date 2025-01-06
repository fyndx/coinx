CREATE INDEX `idx_product_listings_product_id` ON `coinx_product_listing` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_product_listings_store_id` ON `coinx_product_listing` (`store_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_coinx_transaction` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transaction_time` integer NOT NULL,
	`amount` real NOT NULL,
	`note` text,
	`transaction_type` text NOT NULL,
	`category_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`category_id`) REFERENCES `coinx_category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_coinx_transaction`("id", "transaction_time", "amount", "note", "transaction_type", "category_id", "created_at", "updated_at") SELECT "id", "transaction_time", "amount", "note", "transaction_type", "category_id", "created_at", "updated_at" FROM `coinx_transaction`;--> statement-breakpoint
DROP TABLE `coinx_transaction`;--> statement-breakpoint
ALTER TABLE `__new_coinx_transaction` RENAME TO `coinx_transaction`;--> statement-breakpoint
PRAGMA foreign_keys=ON;