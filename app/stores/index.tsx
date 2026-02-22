import { Text } from "@/src/Components/ui/Text";
import { StoresList } from "@/src/Containers/Stores/StoresList";
import { storeModel$ } from "@/src/LegendState/Store/Store.model";
import { useMount } from "@legendapp/state/react";
import { Link } from "expo-router";
import { PlusCircle } from "lucide-react-native";
import { Suspense } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

const Stores = () => {
	useMount(() => {
		storeModel$.getStoresList();
	});

	return (
		<View className="flex-1 p-2">
			<Suspense fallback={<ActivityIndicator />}>
				<StoresList stores={storeModel$.storesList} />
			</Suspense>
			<View className="absolute right-6 bottom-6 bg-blue-100 p-2 rounded-full shadow-md">
				<Link href={"/add-store"} asChild>
					<Pressable>
						<PlusCircle size={32} color="#2563eb" />
					</Pressable>
				</Link>
			</View>
		</View>
	);
};

export default Stores;

const styles = StyleSheet.create({});
