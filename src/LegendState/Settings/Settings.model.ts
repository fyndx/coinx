import { COINX_DATABASE_NAME, db, expoDb } from "@/db/client";
import { observable } from "@legendapp/state";
import { File, Paths } from "expo-file-system/next";
import { defaultDatabaseDirectory } from "expo-sqlite";
import * as Sharing from "expo-sharing";
import { zip } from "react-native-zip-archive";

export const SettingsModel = observable({});

export const shareData = async ({ path }: { path: string }) => {
	try {
		await Sharing.shareAsync(path, {
			mimeType: "application/octet-stream",
			dialogTitle: "Exported Data",
			UTI: "public.data",
		});
		console.log("Sharing data from", path);
	} catch (error) {
		console.error("Error sharing data", error);
	}
};

export const exportData = async () => {
	try {
		const coinxDatabaseUri = `${defaultDatabaseDirectory}/${COINX_DATABASE_NAME}`;
		const dbDumpUri = `${Paths.document.uri}${COINX_DATABASE_NAME}`;
		console.log("Exporting data from", coinxDatabaseUri);
		console.log("Exporting data to", dbDumpUri);

		const coinxFile = new File(coinxDatabaseUri);
		await coinxFile.copy(new File(dbDumpUri));
		await shareData({ path: dbDumpUri });
		console.log("Data exported to", dbDumpUri);
	} catch (error) {
		console.error("Error exporting data", error);
	}
};

export const exportDataToCsv = async () => {
	const DB_FOLDER = `${Paths.document.uri}csv_exports/`;
	console.log("Exporting data to CSV", DB_FOLDER);

	try {
		// Step 1: Fetch all table names
		const result: { name: string }[] = await expoDb.getAllAsync(
			`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`,
			[],
		);
		const tableNames = result
			.map((row) => row.name)
			.filter((name) => name.includes("coinx"));
		console.log({ tableNames });

		// Step 2: Loop through each table
		for (const tableName of tableNames) {
			const result: { name: string }[] = await expoDb.getAllAsync(
				`PRAGMA table_info(${tableName});`,
			);
			// Headers
			const headers = result.map((row) => row.name);
			// Create File
			const fileUri = `${DB_FOLDER}${tableName}.csv`;
			const fileInstance = new File(fileUri);
			fileInstance.parentDirectory.create();
			fileInstance.create();
			// Write Headers
			const openedFile = fileInstance.open();
			openedFile.writeBytes(new TextEncoder().encode(headers.join(",")));
			openedFile.writeBytes(new TextEncoder().encode("\n"));

			// Write Data
			const iterator = expoDb.getEachAsync(`SELECT * FROM ${tableName};`, []);
			for await (const row of iterator) {
				openedFile.writeBytes(
					new TextEncoder().encode(Object.values(row as string).join(",")),
				);
				openedFile.writeBytes(new TextEncoder().encode("\n"));
			}
			openedFile.close();
		}

		// Create Zip
		const SOURCE_DIR = `${Paths.document.uri}csv_exports/`;
		const ZIP_FILE = `${Paths.document.uri}csv_exports.zip`;
		const zipFile = await zip(SOURCE_DIR, ZIP_FILE);

		// Share File
		await Sharing.shareAsync(ZIP_FILE, {
			mimeType: "application/octet-stream",
			dialogTitle: "Exported Data",
			UTI: "public.data",
		});
	} catch (error) {
		console.error("Error exporting data to CSV", error);
	}
};
