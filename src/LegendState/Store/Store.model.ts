import type { InsertStore, SelectStore } from "@/db/schema";
import {
	addStore,
	deleteStoreById,
	editStore,
	getStores,
} from "@/src/database/Stores/StoresRepo";
import { type ObservableArray, observable } from "@legendapp/state";
import * as Burnt from "burnt";
import { Effect } from "effect";
import { router } from "expo-router";

export interface StoresListObservable
	extends ObservableArray<Array<SelectStore>> {}

export class StoreModel {
	storesList: StoresListObservable;
	storeDraft;
	constructor() {
		this.storesList = observable([]);
		this.storeDraft = observable<InsertStore>({
			name: "",
			location: "",
		});
	}

	addStore = async () => {
		await Effect.runPromise(addStore(this.storeDraft.peek()));
		Burnt.toast({ title: "Store added successfully" });
		this.getStoresList();
		router.back();
	};

	editStore = async () => {
		const { name, location, id } = this.storeDraft.peek();
		if (id) {
			await Effect.runPromise(editStore({ name, location }, id));
		}
	};

	getStoresList = async () => {
		const stores = await Effect.runPromise(getStores());
		this.storesList.set(stores);
	};

	deleteStore = async (id: number) => {
		await Effect.runPromise(deleteStoreById(id));
		Burnt.toast({ title: "Store deleted successfully" });
		this.getStoresList();
	};

	reset = () => {
		this.storesList.set([]);
	};

	resetStoreDraft = () => {
		this.storeDraft.set({
			name: "",
			location: "",
		});
	};
}

export const storeModel$ = new StoreModel();
