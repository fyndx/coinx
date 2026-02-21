import { syncManager } from "@/src/services/sync";
import { useEffect, useState } from "react";

/**
 * React hook to subscribe to sync state.
 * Re-renders component when sync status changes.
 */
export function useSync() {
	const [state, setState] = useState(syncManager.getState());

	useEffect(() => {
		return syncManager.subscribe(setState);
	}, []);

	return {
		...state,
		sync: () => syncManager.syncIfAuthenticated(),
		isSyncing: state.status === "pushing" || state.status === "pulling",
	};
}
