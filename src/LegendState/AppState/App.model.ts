import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { observable } from "@legendapp/state";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { loadAsync } from "expo-font";
import { getLocales } from "expo-localization";

import { LatoRegular } from "@/assets/fonts";
import { db, expoDb } from "@/db/client";
import migrations from "@/drizzle/migrations";
import { analytics } from "@/src/services/analytics";
import { AppStorage } from "@/src/storage/mmkv";

interface CurrencyData {
  code: string;
  symbol: string;
  name?: string;
  [key: string]: unknown;
}

export class AppModel {
  obs;
  constructor() {
    this.obs = observable({
      isAppLoaded: false,
      isFirstLaunch: "unknown",
      // TODO: Currency Setup
      currency: undefined as { code: string; symbol: string } | undefined,
      locale: getLocales()[0].languageCode ?? "en",
    });
  }

  runDatabaseMigrations = async () => {
    try {
      await migrate(db, migrations);
      console.log("Database migrations ran successfully");
    } catch (error) {
      console.log("Error running database migrations:", error);
      throw error;
    }
  };

  loadFonts = async () => {
    await loadAsync({
      LatoRegular: LatoRegular,
      ...MaterialCommunityIcons.font,
    });
  };

  private loadCurrency = async () => {
    const currency = AppStorage.getString("currency");
    if (currency) {
      this.obs.currency.set(JSON.parse(currency));
    }
  };

  private setCurrency = async (currency: CurrencyData) => {
    const currencyData = {
      code: currency.code,
      symbol: currency.symbol,
    };

    AppStorage.set("currency", JSON.stringify(currencyData));
    this.obs.currency.set(currencyData);
    analytics.setMetadata("currency_preference", currency.code);
  };

  checkFirstLaunch = async () => {
    const isFirstLaunch = await AsyncStorage.getItem("isFirstLaunch");
    if (isFirstLaunch === null) {
      // Save the current date as the first launch date
      const firstLaunchDate = new Date().toISOString();
      await AsyncStorage.setItem("isFirstLaunch", firstLaunchDate);
      this.obs.isFirstLaunch.set(firstLaunchDate);
      return true;
    }

    this.obs.isFirstLaunch.set(isFirstLaunch);
    return false;
  };

  private startServices = async () => {
    try {
      await Promise.all([
        this.runDatabaseMigrations(),
        this.loadFonts(),
        this.loadCurrency(),
      ]);
      analytics.setMetadata("language_locale", this.obs.locale.get());
    } catch (error) {
      console.log("Error starting services:", error);
    } finally {
      this.obs.isAppLoaded.set(true);
    }
  };

  actions = {
    startServices: this.startServices,
    setCurrency: this.setCurrency,
  };
}

export const appModel = new AppModel();
