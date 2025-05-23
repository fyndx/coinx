import type { StoresListObservable } from "@/src/LegendState/Store/Store.model";
import { observer } from "@legendapp/state/react";
import { Store } from "@tamagui/lucide-icons";
import { Fragment } from "react";
import { ScrollView, Separator, Text, YGroup, YStack } from "tamagui";
import { StoreItem } from "./StoreItem";

interface StoresListProps {
	stores: StoresListObservable;
}

export const StoresList = observer(({ stores }: StoresListProps) => {
	if (stores.length === 0) {
		return (
			<YStack
				padding={"$3"}
				flex={1}
				alignItems={"center"}
				justifyContent={"center"}
			>
				<Store size={"$8"} />
				<Text>
					{"No stores found.\nTap the + icon to add your first store"}
				</Text>
			</YStack>
		);
	}

	return (
		<ScrollView>
			<YGroup padding={"$3"}>
				{stores?.map((store) => {
					return (
						<Fragment key={store.id.peek()}>
							<StoreItem key={store.id.peek()} store={store} />
							<Separator />
						</Fragment>
					);
				})}
			</YGroup>
		</ScrollView>
	);
});
