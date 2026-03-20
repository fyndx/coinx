import { observable } from "@legendapp/state";
import { isNull } from "drizzle-orm";

import { db } from "@/db/client";
import { categories, products, stores } from "@/db/schema";
import { DEFAULT_CATEGORIES } from "@/src/LegendState/Category.model";
import { DEFAULT_PRODUCTS } from "@/src/LegendState/Products/DefaultProducts";
import { DEFAULT_STORES } from "@/src/LegendState/Store/stores-list";
import { api } from "@/src/services/api";
import { syncManager } from "@/src/services/sync";
import { generateUUID } from "@/src/utils/uuid";

export type SetupStatus =
  | "idle"
  | "needsSetup"
  | "running"
  | "success"
  | "error";

export type SetupStep =
  | "idle"
  | "connecting-account"
  | "syncing-data"
  | "checking-data"
  | "creating-defaults"
  | "finishing";

type SetupState = {
  status: SetupStatus;
  step: SetupStep;
  error: string | null;
};

export class SetupModel {
  obs;

  constructor() {
    this.obs = observable<SetupState>({
      status: "idle",
      step: "idle",
      error: null,
    });
  }

  private setupPromise: Promise<{ success: boolean; error?: string }> | null =
    null;

  private getSeedCounts = async () => {
    const [categoryRows, productRows, storeRows] = await Promise.all([
      db
        .select({ id: categories.id })
        .from(categories)
        .where(isNull(categories.deletedAt))
        .limit(1),
      db
        .select({ id: products.id })
        .from(products)
        .where(isNull(products.deletedAt))
        .limit(1),
      db
        .select({ id: stores.id })
        .from(stores)
        .where(isNull(stores.deletedAt))
        .limit(1),
    ]);

    return {
      hasCategories: categoryRows.length > 0,
      hasProducts: productRows.length > 0,
      hasStores: storeRows.length > 0,
    };
  };

  private createDefaultSeedData = async () => {
    await db.transaction(async (tx) => {
      await tx.insert(categories).values(
        DEFAULT_CATEGORIES.map((category) => ({
          ...category,
          id: generateUUID(),
          syncStatus: "pending" as const,
        })),
      );

      await tx.insert(products).values(
        DEFAULT_PRODUCTS.map((product) => ({
          ...product,
          id: generateUUID(),
          syncStatus: "pending" as const,
        })),
      );

      await tx.insert(stores).values(
        DEFAULT_STORES.map((store) => ({
          ...store,
          id: generateUUID(),
          syncStatus: "pending" as const,
        })),
      );
    });
  };

  private setStep = (step: SetupStep) => {
    this.obs.step.set(step);
  };

  reset = (status: SetupStatus = "idle") => {
    this.obs.status.set(status);
    this.obs.step.set(status === "needsSetup" ? "connecting-account" : "idle");
    this.obs.error.set(null);
  };

  clearError = () => {
    this.obs.error.set(null);
  };

  run = async () => {
    if (this.setupPromise) {
      return this.setupPromise;
    }

    this.setupPromise = (async () => {
      this.obs.status.set("running");
      this.obs.error.set(null);

      try {
        this.setStep("connecting-account");
        await api.post("/api/auth/register", {});

        this.setStep("syncing-data");
        await syncManager.syncAuthenticated();

        this.setStep("checking-data");
        const seedCounts = await this.getSeedCounts();
        const needsSeedData =
          !seedCounts.hasCategories &&
          !seedCounts.hasProducts &&
          !seedCounts.hasStores;

        if (needsSeedData) {
          this.setStep("creating-defaults");
          await this.createDefaultSeedData();

          this.setStep("finishing");
          await syncManager.syncAuthenticated();
        }

        this.obs.status.set("success");
        this.obs.step.set("idle");
        this.obs.error.set(null);
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to finish setup";
        this.obs.status.set("error");
        this.obs.error.set(message);
        return { success: false, error: message };
      } finally {
        this.setupPromise = null;
      }
    })();

    return this.setupPromise;
  };

  actions = {
    run: this.run,
    reset: this.reset,
    clearError: this.clearError,
  };
}

export const setupModel = new SetupModel();
