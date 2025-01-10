import type { SelectStore } from "@/db/schema";
import { SwipeableRow } from "@/src/Components/SwipeableRow";
import { storeModel$ } from "@/src/LegendState/Store/Store.model";
import type { ObservableObject } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { Trash2 } from "@tamagui/lucide-icons";
import { Link } from "expo-router";
import { ListItem, Text, XStack, YGroup } from "tamagui";

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
		<YGroup.Item key={storeData.id}>
			<SwipeableRow
				key={storeData.id}
				rightActions={[
					{
						content: <Trash2 color={"$white5"} />,
						style: { backgroundColor: "red" },
						onPress: handleStoreDelete,
					},
				]}
			>
				<ListItem alignItems="center">
					<Link
						href={{
							pathname: "/add-store",
						}}
						onPress={handleStoreEdit}
					>
						<XStack flex={1} gap={"$4"} justifyContent={"space-between"}>
							<Text fontSize={"$6"}>{store.name}</Text>
							<Text fontSize={"$6"}>{store.location}</Text>
						</XStack>
					</Link>
				</ListItem>
			</SwipeableRow>
		</YGroup.Item>
	);
});
