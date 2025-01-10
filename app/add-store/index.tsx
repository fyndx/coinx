import { storeModel$ } from "@/src/LegendState/Store/Store.model";
import { observer, useUnmount } from "@legendapp/state/react";
import { Keyboard } from "react-native";
import { Button, Input, YStack } from "tamagui";

const AddStore = observer(() => {
	const { storeDraft } = storeModel$;

	useUnmount(() => {
		storeModel$.resetStoreDraft();
	});

	const handleStoreNameChange = (value: string) => {
		storeModel$.storeDraft.name.set(value.trim());
	};

	const handleStoreLocationChange = (value: string) => {
		storeModel$.storeDraft.location.set(value.trim());
	};

	const handleSubmit = () => {
		if (storeDraft.id) {
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
					value={storeDraft.name.get()}
					autoFocus
				/>
				<Input
					placeholder={"Store Location"}
					onChangeText={handleStoreLocationChange}
					value={storeDraft.location.get()}
				/>
			</YStack>
			<Button onPress={handleSubmit}>{"Add Store"}</Button>
		</YStack>
	);
});

export default AddStore;
