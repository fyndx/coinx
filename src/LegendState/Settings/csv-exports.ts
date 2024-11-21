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
	const result: { name: string }[] = await expoDb.getAllAsync(
		`PRAGMA table_info(${tableName});`,
	);
	// Headers
	const headers = result.map((row) => row.name);
	// Create File
	const fileInstance = new File(fileUri);
	// TODO: Create parent directory if it doesn't exist
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
	await zip(sourceDir, destZipFile);
};
