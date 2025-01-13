import { StoresList } from "@/src/Containers/Stores/StoresList";
import { storeModel$ } from "@/src/LegendState/Store/Store.model";
import { useMount } from "@legendapp/state/react";
import { PlusCircle } from "@tamagui/lucide-icons";
import { Link } from "expo-router";
import { Suspense } from "react";
import { StyleSheet } from "react-native";
import { Circle, Text, YStack } from "tamagui";

const Stores = () => {
	useMount(() => {
		storeModel$.getStoresList();
	});

	return (
		<YStack padding={"$2"} flex={1}>
			<Suspense fallback={<Text>Loading...</Text>}>
				<StoresList stores={storeModel$.storesList} />
			</Suspense>
			<Circle
				position="absolute"
				right={"$6"}
				bottom={"$6"}
				backgroundColor={"$blue10Light"}
				padding={"$1"}
				pressStyle={{ opacity: 0.8 }}
				// biome-ignore lint/a11y/useSemanticElements: Fab button is not a semantic element
				role="button"
				aria-label="Add new store"
			>
				<Link href={"/add-store"}>
					<PlusCircle size={"$4"} color="white" />
				</Link>
			</Circle>
		</YStack>
	);
};

export default Stores;

const styles = StyleSheet.create({});
