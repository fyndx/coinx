import type { SelectStore } from "@/db/schema";
import { SwipeableRow } from "@/src/Components/SwipeableRow";
import { Text } from "@/src/Components/ui/Text";
import { storeModel$ } from "@/src/LegendState/Store/Store.model";
import type { ObservableObject } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { Link } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { Pressable, View } from "react-native";

interface StoreItemProps {
	store: ObservableObject<SelectStore>;
}

export const StoreItem = observer(({ store }: StoreItemProps) => {
	const storeData = store.peek();

	const handleStoreEdit = () => {
		storeModel$.storeDraft.set(storeData);
	};

	const handleStoreDelete = () => {
		storeModel$.deleteStore(storeData.id);
	};

	return (
		<View key={storeData.id} className="border-b border-border">
			<SwipeableRow
				key={storeData.id}
				rightActions={[
					{
						content: <Trash2 color="white" />,
						style: { backgroundColor: "red" },
						onPress: handleStoreDelete,
					},
				]}
			>
				<Link
					href={{
						pathname: "/add-store",
					}}
					onPress={handleStoreEdit}
					asChild
				>
					<Pressable className="flex-row flex-1 p-4 justify-between items-center bg-background">
						<Text className="text-lg">{storeData.name}</Text>
						<Text className="text-lg text-muted-foreground">
							{storeData.location}
						</Text>
					</Pressable>
				</Link>
			</SwipeableRow>
		</View>
	);
});
