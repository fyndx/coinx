import type { InsertStore, SelectStore } from "@/db/schema";
import {
	addStore,
	deleteStoreById,
	editStore,
	getStores,
} from "@/src/database/Stores/StoresRepo";
import {
	type Observable,
	type ObservableArray,
	observable,
} from "@legendapp/state";
import * as Burnt from "burnt";
import { Effect } from "effect";
import { router } from "expo-router";
import { DEFAULT_STORES } from "./stores-list";

export interface StoresListObservable
	extends ObservableArray<Array<SelectStore>> {}

type StoreDraft = Omit<InsertStore, "id"> & { id?: string };

export class StoreModel {
	storesList: StoresListObservable;
	storeDraft: Observable<StoreDraft>;
	isSubmitting: Observable<boolean>;

	constructor() {
		this.storesList = observable([]);
		this.storeDraft = observable<StoreDraft>({
			name: "",
			location: "",
		});
		this.isSubmitting = observable(false);
	}

	addStore = async () => {
		this.isSubmitting.set(true);
		Effect.runPromise(addStore(this.storeDraft.peek()))
			.then((result) => {
				Burnt.toast({ title: "Store added successfully" });
				this.getStoresList();
				router.back();
			})
			.catch((error) => {
				Burnt.toast({
					title: "Failed to add store",
					message: error.message,
				});
			})
			.finally(() => {
				this.isSubmitting.set(false);
			});
	};

	editStore = async () => {
		const { name, location, id } = this.storeDraft.peek();
		if (id) {
			this.isSubmitting.set(true);
			Effect.runPromise(editStore({ name, location }, id))
				.then((result) => {
					Burnt.toast({ title: "Store updated successfully" });
					this.getStoresList();
					router.back();
				})
				.catch((error) => {
					Burnt.toast({
						title: "Failed to update store",
						message: error.message,
					});
				})
				.finally(() => {
					this.isSubmitting.set(false);
				});
		}
	};

	getStoresList = async () => {
		const stores = await Effect.runPromise(getStores());
		this.storesList.set(stores);
	};

	deleteStore = (id: string) => {
		this.isSubmitting.set(true);
		Effect.runPromise(deleteStoreById(id))
			.then((result) => {
				Burnt.toast({ title: "Store deleted successfully" });
				this.getStoresList();
			})
			.catch((error) => {
				Burnt.toast({
					title: "Failed to delete store",
					message: error.message,
				});
			})
			.finally(() => {
				this.isSubmitting.set(false);
			});
	};

	reset = () => {
		this.storesList.set([]);
	};

	resetStoreDraft = () => {
		this.storeDraft.set({
			id: undefined,
			name: "",
			location: "",
		});
	};

	createDefaultStores = async () => {
		await Effect.runPromise(addStore(DEFAULT_STORES));
	};
}

export const storeModel$ = new StoreModel();
