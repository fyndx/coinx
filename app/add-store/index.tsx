import { storeModel$ } from "@/src/LegendState/Store/Store.model";
import { observer, useUnmount } from "@legendapp/state/react";
import { Keyboard } from "react-native";
import { Button, Input, YStack } from "tamagui";

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
		<YStack
			flex={1}
			padding={"$4"}
			justifyContent={"space-between"}
			onPress={Keyboard.dismiss}
		>
			<YStack gap={"$3"}>
				<Input
					placeholder={"Store Name"}
					onChangeText={handleStoreNameChange}
					value={name}
					autoFocus
				/>
				<Input
					placeholder={"Store Location"}
					onChangeText={handleStoreLocationChange}
					value={location}
				/>
			</YStack>
			<Button onPress={handleSubmit} disabled={isSubmitting}>
				{isSubmitting ? "Saving..." : id ? "Update Store" : "Add Store"}
			</Button>
		</YStack>
	);
});

export default AddStore;
