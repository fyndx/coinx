import { storeModel$ } from "@/src/LegendState/Store/Store.model";
import { observer, useUnmount } from "@legendapp/state/react";
import { Keyboard, View } from "react-native";
import { Button } from "heroui-native";
import { Input } from "@/src/Components/ui/Input";
import { Text } from "@/src/Components/ui/Text";

const AddStore = observer(() => {
	const { storeDraft } = storeModel$;
	const { id, name, location } = storeDraft.get();
	const isSubmitting = storeModel$.isSubmitting.get();

	useUnmount(() => {
		storeModel$.resetStoreDraft();
	});

	const handleStoreNameChange = (value: string) => {
		storeModel$.storeDraft.name.set(value);
	};

	const handleStoreLocationChange = (value: string) => {
		storeModel$.storeDraft.location.set(value);
	};

	const handleSubmit = () => {
		if (id) {
			storeModel$.editStore();
		} else {
			storeModel$.addStore();
		}
	};

	return (
		<View className="flex-1 p-4 justify-between" onTouchEnd={Keyboard.dismiss}>
			<View className="gap-3">
				<Input
					placeholder={"Store Name"}
					onChangeText={handleStoreNameChange}
					value={name}
					autoFocus
				/>
				<Input
					placeholder={"Store Location"}
					onChangeText={handleStoreLocationChange}
					value={location ?? ""}
				/>
			</View>
			<Button onPress={handleSubmit} disabled={isSubmitting}>
				<Text>
					{isSubmitting ? "Saving..." : id ? "Update Store" : "Add Store"}
				</Text>
			</Button>
		</View>
	);
});

export default AddStore;
