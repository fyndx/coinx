/**
 * UUID Migration Script
 *
 * This script handles the migration from integer IDs to UUIDs.
 * It must be run BEFORE the schema migration for existing users with data.
 *
 * For new installs (empty database), this script does nothing - Drizzle
 * will create the tables with UUID columns directly.
 */

import * as Crypto from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
	return Crypto.randomUUID();
}

/**
 * Check if migration is needed (tables have integer IDs)
 */
async function needsMigration(db: SQLiteDatabase): Promise<boolean> {
	try {
		// Check if the old schema exists by looking at the column type
		const result = await db.getFirstAsync<{ type: string }>(
			`SELECT type FROM pragma_table_info('coinx_category') WHERE name = 'id'`,
		);
		// If 'id' column type is INTEGER, we need migration
		return result?.type === "INTEGER";
	} catch {
		// Table doesn't exist, fresh install
		return false;
	}
}

/**
 * Run the UUID migration for existing data
 */
export async function runUUIDMigration(db: SQLiteDatabase): Promise<void> {
	const migrationNeeded = await needsMigration(db);

	if (!migrationNeeded) {
		console.log(
			"[UUID Migration] Not needed - fresh install or already migrated",
		);
		return;
	}

	console.log(
		"[UUID Migration] Starting migration from integer IDs to UUIDs...",
	);

	await db.execAsync("PRAGMA foreign_keys = OFF;");

	try {
		// Wrap entire migration in a transaction for atomicity
		await db.execAsync("BEGIN TRANSACTION;");

		// Step 1: Create UUID mapping tables
		await db.execAsync(`
      CREATE TABLE IF NOT EXISTS _uuid_map_categories (old_id INTEGER PRIMARY KEY, new_id TEXT);
      CREATE TABLE IF NOT EXISTS _uuid_map_transactions (old_id INTEGER PRIMARY KEY, new_id TEXT);
      CREATE TABLE IF NOT EXISTS _uuid_map_products (old_id INTEGER PRIMARY KEY, new_id TEXT);
      CREATE TABLE IF NOT EXISTS _uuid_map_stores (old_id INTEGER PRIMARY KEY, new_id TEXT);
      CREATE TABLE IF NOT EXISTS _uuid_map_product_listings (old_id INTEGER PRIMARY KEY, new_id TEXT);
      CREATE TABLE IF NOT EXISTS _uuid_map_product_listings_history (old_id INTEGER PRIMARY KEY, new_id TEXT);
    `);

		// Step 2: Generate UUIDs for all existing records
		const tables = [
			{ map: "_uuid_map_categories", source: "coinx_category" },
			{ map: "_uuid_map_transactions", source: "coinx_transaction" },
			{ map: "_uuid_map_products", source: "coinx_product" },
			{ map: "_uuid_map_stores", source: "coinx_store" },
			{ map: "_uuid_map_product_listings", source: "coinx_product_listing" },
			{
				map: "_uuid_map_product_listings_history",
				source: "coinx_product_listing_history",
			},
		];

		for (const { map, source } of tables) {
			const rows = await db.getAllAsync<{ id: number }>(
				`SELECT id FROM ${source}`,
			);
			for (const row of rows) {
				await db.runAsync(`INSERT INTO ${map} (old_id, new_id) VALUES (?, ?)`, [
					row.id,
					generateUUID(),
				]);
			}
			console.log(
				`[UUID Migration] Generated ${rows.length} UUIDs for ${source}`,
			);
		}

		// Step 3: Migrate categories
		await db.execAsync(`
      CREATE TABLE coinx_category_new (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        deleted_at TEXT
      );
      
      INSERT INTO coinx_category_new (id, name, icon, color, type, created_at, updated_at, sync_status, deleted_at)
      SELECT m.new_id, c.name, c.icon, c.color, c.type, c.created_at, c.updated_at, 'pending', NULL
      FROM coinx_category c
      JOIN _uuid_map_categories m ON c.id = m.old_id;
    `);

		// Step 4: Migrate transactions
		await db.execAsync(`
      CREATE TABLE coinx_transaction_new (
        id TEXT PRIMARY KEY NOT NULL,
        transaction_time TEXT NOT NULL,
        amount REAL NOT NULL,
        note TEXT,
        transaction_type TEXT NOT NULL,
        category_id TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        deleted_at TEXT,
        FOREIGN KEY (category_id) REFERENCES coinx_category_new(id)
      );
      
      INSERT INTO coinx_transaction_new (id, transaction_time, amount, note, transaction_type, category_id, created_at, updated_at, sync_status, deleted_at)
      SELECT tm.new_id, t.transaction_time, t.amount, t.note, t.transaction_type, cm.new_id, t.created_at, t.updated_at, 'pending', NULL
      FROM coinx_transaction t
      JOIN _uuid_map_transactions tm ON t.id = tm.old_id
      JOIN _uuid_map_categories cm ON t.category_id = cm.old_id;
    `);

		// Step 5: Migrate products
		await db.execAsync(`
      CREATE TABLE coinx_product_new (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        image TEXT,
        notes TEXT,
        default_unit_category TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        deleted_at TEXT
      );
      
      INSERT INTO coinx_product_new (id, name, image, notes, default_unit_category, created_at, updated_at, sync_status, deleted_at)
      SELECT m.new_id, p.name, p.image, p.notes, p.default_unit_category, p.created_at, NULL, 'pending', NULL
      FROM coinx_product p
      JOIN _uuid_map_products m ON p.id = m.old_id;
    `);

		// Step 6: Migrate stores
		await db.execAsync(`
      CREATE TABLE coinx_store_new (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        location TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        deleted_at TEXT
      );
      
      INSERT INTO coinx_store_new (id, name, location, created_at, updated_at, sync_status, deleted_at)
      SELECT m.new_id, s.name, s.location, s.created_at, s.updated_at, 'pending', NULL
      FROM coinx_store s
      JOIN _uuid_map_stores m ON s.id = m.old_id;
    `);

		// Step 7: Migrate product listings
		await db.execAsync(`
      CREATE TABLE coinx_product_listing_new (
        id TEXT PRIMARY KEY NOT NULL,
        product_id TEXT NOT NULL,
        name TEXT NOT NULL,
        store_id TEXT NOT NULL,
        url TEXT,
        price REAL NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        deleted_at TEXT,
        FOREIGN KEY (product_id) REFERENCES coinx_product_new(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES coinx_store_new(id) ON DELETE CASCADE
      );
      
      INSERT INTO coinx_product_listing_new (id, product_id, name, store_id, url, price, quantity, unit, created_at, updated_at, sync_status, deleted_at)
      SELECT plm.new_id, pm.new_id, pl.name, sm.new_id, pl.url, pl.price, pl.quantity, pl.unit, pl.created_at, pl.updated_at, 'pending', NULL
      FROM coinx_product_listing pl
      JOIN _uuid_map_product_listings plm ON pl.id = plm.old_id
      JOIN _uuid_map_products pm ON pl.product_id = pm.old_id
      JOIN _uuid_map_stores sm ON pl.store_id = sm.old_id;
    `);

		// Step 8: Migrate product listings history
		await db.execAsync(`
      CREATE TABLE coinx_product_listing_history_new (
        id TEXT PRIMARY KEY NOT NULL,
        product_id TEXT NOT NULL,
        product_listing_id TEXT NOT NULL,
        price REAL NOT NULL,
        recorded_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TEXT,
        sync_status TEXT DEFAULT 'pending',
        deleted_at TEXT,
        FOREIGN KEY (product_id) REFERENCES coinx_product_new(id) ON DELETE CASCADE,
        FOREIGN KEY (product_listing_id) REFERENCES coinx_product_listing_new(id) ON DELETE CASCADE
      );
      
      INSERT INTO coinx_product_listing_history_new (id, product_id, product_listing_id, price, recorded_at, updated_at, sync_status, deleted_at)
      SELECT hm.new_id, pm.new_id, plm.new_id, h.price, h.recorded_at, NULL, 'pending', NULL
      FROM coinx_product_listing_history h
      JOIN _uuid_map_product_listings_history hm ON h.id = hm.old_id
      JOIN _uuid_map_products pm ON h.product_id = pm.old_id
      JOIN _uuid_map_product_listings plm ON h.product_listing_id = plm.old_id;
    `);

		// Step 9: Drop old tables and rename new ones
		await db.execAsync(`
      DROP TABLE coinx_transaction;
      DROP TABLE coinx_product_listing_history;
      DROP TABLE coinx_product_listing;
      DROP TABLE coinx_category;
      DROP TABLE coinx_product;
      DROP TABLE coinx_store;
      
      ALTER TABLE coinx_category_new RENAME TO coinx_category;
      ALTER TABLE coinx_transaction_new RENAME TO coinx_transaction;
      ALTER TABLE coinx_product_new RENAME TO coinx_product;
      ALTER TABLE coinx_store_new RENAME TO coinx_store;
      ALTER TABLE coinx_product_listing_new RENAME TO coinx_product_listing;
      ALTER TABLE coinx_product_listing_history_new RENAME TO coinx_product_listing_history;
    `);

		// Step 10: Create indexes
		await db.execAsync(`
      CREATE UNIQUE INDEX coinx_category_name_unique ON coinx_category (name);
      CREATE UNIQUE INDEX coinx_category_icon_unique ON coinx_category (icon);
      CREATE UNIQUE INDEX coinx_category_color_unique ON coinx_category (color);
      CREATE UNIQUE INDEX unique_store_name_location ON coinx_store (name, location);
      CREATE INDEX idx_product_listings_product_id ON coinx_product_listing (product_id);
      CREATE INDEX idx_product_listings_store_id ON coinx_product_listing (store_id);
      CREATE INDEX idx_product_listings_history_product_id ON coinx_product_listing_history (product_id);
      CREATE INDEX idx_product_listings_history_product_listing_id ON coinx_product_listing_history (product_listing_id);
      CREATE INDEX idx_product_listings_history_recorded_at ON coinx_product_listing_history (recorded_at);
    `);

		// Step 11: Cleanup mapping tables
		await db.execAsync(`
      DROP TABLE _uuid_map_categories;
      DROP TABLE _uuid_map_transactions;
      DROP TABLE _uuid_map_products;
      DROP TABLE _uuid_map_stores;
      DROP TABLE _uuid_map_product_listings;
      DROP TABLE _uuid_map_product_listings_history;
    `);

		// Step 12: Mark the Drizzle UUID migration as applied
		// This prevents Drizzle from trying to run it again
		await db.execAsync(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hash TEXT NOT NULL,
        created_at INTEGER
      );
    `);

		// Insert the migration hash for 0001_flaky_senator_kelly
		// The hash is derived from the migration file content
		const migrationHash = "0001_flaky_senator_kelly";
		const existingMigration = await db.getFirstAsync<{ hash: string }>(
			"SELECT hash FROM __drizzle_migrations WHERE hash = ?",
			[migrationHash],
		);

		if (!existingMigration) {
			await db.runAsync(
				"INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
				[migrationHash, Date.now()],
			);
			console.log("[UUID Migration] Marked Drizzle migration as applied");
		}

		// Commit the transaction
		await db.execAsync("COMMIT;");
		console.log("[UUID Migration] Migration completed successfully!");
	} catch (error) {
		// Rollback on any error
		console.error("[UUID Migration] Migration failed, rolling back:", error);
		await db.execAsync("ROLLBACK;");
		throw error;
	} finally {
		await db.execAsync("PRAGMA foreign_keys = ON;");
	}
}
