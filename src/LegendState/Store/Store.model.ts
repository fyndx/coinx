import type { InsertStore, SelectStore } from "@/db/schema";
import { addStore, getStores } from "@/src/database/Stores/StoresRepo";
import { observable } from "@legendapp/state";
import { Effect } from "effect";

export class StoreModel {
	storesList;
	constructor() {
		this.storesList = observable<SelectStore[]>([]);
	}

	addStore = async (store: InsertStore) => {
		await Effect.runPromise(addStore(store));
		this.getStoresList();
	};

	getStoresList = async () => {
		const stores = await Effect.runPromise(getStores());
		console.log("stores", stores);
		this.storesList.set(stores);
	};

	reset = () => {
		this.storesList.set([]);
	};
}

export const storeModel$ = new StoreModel();
