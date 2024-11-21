import { COINX_DATABASE_NAME } from "@/db/client";
import { observable } from "@legendapp/state";
import { Effect } from "effect";
import { Directory, File, Paths } from "expo-file-system/next";
import * as Sharing from "expo-sharing";
import { defaultDatabaseDirectory } from "expo-sqlite";
import {
	createZipArchive,
	listDatabaseTables,
	saveTablesToCsv,
} from "./csv-exports";

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
	const ZIP_FILE = `${Paths.document.uri}csv_exports.zip`;
	console.log("Exporting data to CSV", CSV_EXPORTS_FOLDER);

	try {
		// Step 1: Fetch all table names
		const result = await Effect.runPromise(listDatabaseTables);

		const tableNames = result
			.map((row) => row.name)
			.filter((name) => name.includes("coinx"));
		console.log({ tableNames });

		// Step 2: Save each table to CSV
		const exportsDir = new Directory(CSV_EXPORTS_FOLDER);
		if (exportsDir.exists) {
			exportsDir.delete();
			exportsDir.create();
		} else {
			exportsDir.create();
		}
		await saveTablesToCsv({
			csvDestinationFolderPath: CSV_EXPORTS_FOLDER,
			tableNames,
		});

		// Create Zip
		await createZipArchive({
			sourceDir: CSV_EXPORTS_FOLDER,
			destZipFile: ZIP_FILE,
		});

		// Share File
		await Sharing.shareAsync(ZIP_FILE, {
			mimeType: "application/octet-stream",
			dialogTitle: "Exported Data",
			UTI: "public.data",
		});
	} catch (error) {
		console.error("Error exporting data to CSV", error);
	} finally {
		// Cleanup
		const zipFile = new File(ZIP_FILE);
		if (zipFile.exists) {
			zipFile.delete();
		}

		const exportsDir = new Directory(CSV_EXPORTS_FOLDER);
		if (exportsDir.exists) {
			exportsDir.delete();
		}
	}
};
