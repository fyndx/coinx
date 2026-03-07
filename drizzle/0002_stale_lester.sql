ALTER TABLE `coinx_category` ADD `local_owner_id` text;--> statement-breakpoint
ALTER TABLE `coinx_product_listing` ADD `local_owner_id` text;--> statement-breakpoint
ALTER TABLE `coinx_product_listing_history` ADD `local_owner_id` text;--> statement-breakpoint
ALTER TABLE `coinx_product` ADD `local_owner_id` text;--> statement-breakpoint
ALTER TABLE `coinx_store` ADD `local_owner_id` text;--> statement-breakpoint
ALTER TABLE `coinx_transaction` ADD `local_owner_id` text;