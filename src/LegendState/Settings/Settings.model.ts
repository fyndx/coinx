import { observable } from "@legendapp/state";
import { Effect } from "effect";
import { Platform } from "react-native";

import { COINX_DATABASE_NAME } from "@/db/client";

import {
  createZipArchive,
  listDatabaseTables,
  saveTablesToCsv,
} from "./csv-exports";

export const SettingsModel = observable({});

export const shareData = async ({ path }: { path: string }) => {
  if (Platform.OS === "web") {
    console.warn("shareData is not supported on web");
    return;
  }
  try {
    const Sharing = await import("expo-sharing");
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
  if (Platform.OS === "web") {
    console.warn("exportData is not supported on web");
    return;
  }
  try {
    const { File, Paths } = await import("expo-file-system");
    const { defaultDatabaseDirectory } = await import("expo-sqlite");
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
  if (Platform.OS === "web") {
    console.warn("exportDataToCsv is not supported on web");
    return;
  }

  try {
    const { Directory, File, Paths } = await import("expo-file-system");
    const CSV_EXPORTS_FOLDER = `${Paths.document.uri}csv_exports/`;
    const ZIP_FILE = `${Paths.document.uri}csv_exports.zip`;
    console.log("Exporting data to CSV", CSV_EXPORTS_FOLDER);

    const result = await Effect.runPromise(listDatabaseTables);
    const tableNames = result
      .map((row) => row.name)
      .filter((name) => name.includes("coinx"));
    console.log({ tableNames });

    const exportsDir = new Directory(CSV_EXPORTS_FOLDER);
    if (exportsDir.exists) {
      exportsDir.delete();
    }
    exportsDir.create();
    await saveTablesToCsv({
      csvDestinationFolderPath: CSV_EXPORTS_FOLDER,
      tableNames,
    });

    await createZipArchive({
      sourceDir: CSV_EXPORTS_FOLDER,
      destZipFile: ZIP_FILE,
    });

    const Sharing = await import("expo-sharing");
    await Sharing.shareAsync(ZIP_FILE, {
      mimeType: "application/octet-stream",
      dialogTitle: "Exported Data",
      UTI: "public.data",
    });
  } catch (error) {
    console.error("Error exporting data to CSV", error);
  } finally {
    try {
      const { Directory, File, Paths } = await import("expo-file-system");
      const CSV_EXPORTS_FOLDER = `${Paths.document.uri}csv_exports/`;
      const ZIP_FILE = `${Paths.document.uri}csv_exports.zip`;

      const zipFile = new File(ZIP_FILE);
      if (zipFile.exists) {
        zipFile.delete();
      }
      const exportsDir = new Directory(CSV_EXPORTS_FOLDER);
      if (exportsDir.exists) {
        exportsDir.delete();
      }
    } catch {
      // Cleanup failed, ignore
    }
  }
};
