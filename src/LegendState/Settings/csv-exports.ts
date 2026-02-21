import { expoDb } from "@/db/client";
import { Effect } from "effect";
import { File, Paths } from "expo-file-system/next";
import { zip } from "react-native-zip-archive";

export const listDatabaseTables = Effect.promise<{ name: string }[]>(() => {
	return expoDb.getAllAsync(
		`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`,
		[],
	);
});

export const saveTableToCsv = async ({
	tableName,
	fileUri,
}: { tableName: string; fileUri: string }) => {
	try {
		const result: { name: string }[] = await expoDb.getAllAsync(
			`PRAGMA table_info(${tableName});`,
		);
		// Headers
		const headers = result.map((row) => row.name);
		// Create File
		const fileInstance = new File(fileUri);
		fileInstance.create();
		// Write Headers
		const openedFile = fileInstance.open();
		openedFile.writeBytes(new TextEncoder().encode(headers.join(",")));
		openedFile.writeBytes(new TextEncoder().encode("\n"));
		// Write Data
		const iterator = expoDb.getEachAsync(`SELECT * FROM ${tableName};`, []);
		for await (const row of iterator) {
			openedFile.writeBytes(
				new TextEncoder().encode(
					Object.values(row as { [key: string]: unknown })
						.map((value) => {
							if (value === null) return "";
							const str = String(value);
							return str.includes(",") ? `"${str.replace(/"/g, '""')}"` : str;
						})
						.join(","),
				),
			);
			openedFile.writeBytes(new TextEncoder().encode("\n"));
		}
		openedFile.close();
	} catch (error) {
		console.error(`Failed to save table ${tableName} to CSV:`, error);
	}
};

export const saveTablesToCsv = async ({
	tableNames,
	csvDestinationFolderPath,
}: { tableNames: string[]; csvDestinationFolderPath: string }) => {
	for (const tableName of tableNames) {
		const csvFileName = `${csvDestinationFolderPath}${tableName}.csv`;
		await saveTableToCsv({ tableName, fileUri: csvFileName });
	}
};

export const createZipArchive = async ({
	sourceDir,
	destZipFile,
}: { sourceDir: string; destZipFile: string }) => {
	try {
		await zip(sourceDir, destZipFile);
	} catch (error) {
		throw new Error(
			`Failed to create zip archive: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};
