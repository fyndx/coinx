import { COINX_DATABASE_NAME, db, expoDb } from "@/db/client";
import { observable } from "@legendapp/state";
import { Directory, File, Paths } from "expo-file-system/next";
import * as Sharing from "expo-sharing";
import { defaultDatabaseDirectory } from "expo-sqlite";
import {
	createZipArchive,
	listDatabaseTables,
	saveTablesToCsv,
} from "./csv-exports";
import { Effect } from "effect";

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
	const CSV_EXPORTS_FOLDER = `${Paths.document.uri}csv_exports/`;
	console.log("Exporting data to CSV", CSV_EXPORTS_FOLDER);

	try {
		// Step 1: Fetch all table names
		const result = await Effect.runPromise(listDatabaseTables);

		const tableNames = result
			.map((row) => row.name)
			.filter((name) => name.includes("coinx"));
		console.log({ tableNames });

		// Step 2: Loop through each table
		new Directory(CSV_EXPORTS_FOLDER).create();
		await saveTablesToCsv({
			csvDestinationFolderPath: CSV_EXPORTS_FOLDER,
			tableNames,
		});

		// Create Zip
		const SOURCE_DIR = `${Paths.document.uri}csv_exports/`;
		const ZIP_FILE = `${Paths.document.uri}csv_exports.zip`;
		await createZipArchive({ sourceDir: SOURCE_DIR, destZipFile: ZIP_FILE });

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
