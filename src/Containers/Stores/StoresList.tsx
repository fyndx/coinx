import type { StoresListObservable } from "@/src/LegendState/Store/Store.model";
import { observer } from "@legendapp/state/react";
import { Fragment } from "react";
import { YGroup } from "tamagui";
import { StoreItem } from "./StoreItem";

interface StoresListProps {
	stores: StoresListObservable;
}

export const StoresList = observer(({ stores }: StoresListProps) => {
	return (
		<YGroup padding={"$3"}>
			{stores?.map((store) => {
				return (
					<Fragment key={store.id.peek()}>
						<StoreItem store={store} />
					</Fragment>
				);
			})}
		</YGroup>
	);
});
