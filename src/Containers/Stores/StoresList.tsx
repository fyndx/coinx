import { Text } from "@/src/Components/ui/Text";
import type { StoresListObservable } from "@/src/LegendState/Store/Store.model";
import { observer } from "@legendapp/state/react";
import { Store } from "lucide-react-native";
import { Fragment } from "react";
import { ScrollView, View } from "react-native";
import { StoreItem } from "./StoreItem";

interface StoresListProps {
	stores: StoresListObservable;
}

export const StoresList = observer(({ stores }: StoresListProps) => {
	if (stores.length === 0) {
		return (
			<View className="flex-1 items-center justify-center p-4">
				<Store size={32} color="gray" />
				<Text className="text-center mt-2 text-muted-foreground">
					{"No stores found.\nTap the + icon to add your first store"}
				</Text>
			</View>
		);
	}

	return (
		<ScrollView className="flex-1">
			<View className="p-4 bg-card rounded-lg">
				{stores?.map((store) => {
					return (
						<Fragment key={store.id.peek()}>
							<StoreItem key={store.id.peek()} store={store} />
						</Fragment>
					);
				})}
			</View>
		</ScrollView>
	);
});
