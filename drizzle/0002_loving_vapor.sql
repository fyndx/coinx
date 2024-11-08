CREATE TABLE `product_listings_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_listing_id` integer NOT NULL,
	`price` real NOT NULL,
	`quantity` real NOT NULL,
	`unit` text NOT NULL,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`product_listing_id`) REFERENCES `product_listings`(`id`) ON UPDATE no action ON DELETE cascade
);
