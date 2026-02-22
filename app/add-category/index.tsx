import { Input } from "@/src/Components/ui/Input";
import { Text } from "@/src/Components/ui/Text";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { observer } from "@legendapp/state/react";
import { Button } from "heroui-native";
import { PlusSquare, Smile } from "lucide-react-native";
import { useMemo, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import ColorPicker, {
	BlueSlider,
	GreenSlider,
	OpacitySlider,
	Panel4,
	Panel5,
	RedSlider,
	Swatches,
} from "reanimated-color-picker";
import EmojiPicker, { type EmojiType } from "rn-emoji-keyboard";
import { rootStore } from "../../src/LegendState";

type CategoryState = typeof rootStore.categoryModel.category;

const CategoryType = observer(({ state$ }: { state$: CategoryState }) => {
	const onCategoryChanged = (value: string) => {
		console.log({ value });
		state$.type.set(value as "Income" | "Expense");
	};

	const type = state$.type.get();

	return (
		<View className="justify-center items-center py-6">
			<View className="flex-row bg-muted rounded-md p-1">
				{["Expense", "Income"].map((value) => (
					<Pressable
						key={value}
						onPress={() => onCategoryChanged(value)}
						className={`px-4 py-2 rounded-sm ${
							type === value ? "bg-background shadow-sm" : ""
						}`}
					>
						<Text
							className={`${
								type === value
									? "font-medium text-foreground"
									: "text-muted-foreground"
							}`}
						>
							{value}
						</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
});

const Emoji = observer(({ state$ }: { state$: CategoryState }) => {
	const handlePickedEmoji = (val: EmojiType) => {
		state$.icon.set(val.emoji);
	};

	return (
		<>
			<Pressable
				className="w-16 h-16 bg-blue-100 items-center justify-center rounded-lg"
				onPress={state$.isEmojiPickerOpen.toggle}
			>
				{state$.icon.get().length === 0 ? (
					<Smile size={32} color="black" />
				) : (
					<Text className="text-4xl">{state$.icon.get()}</Text>
				)}
			</Pressable>
			<EmojiPicker
				onEmojiSelected={handlePickedEmoji}
				open={state$.isEmojiPickerOpen.get()}
				onClose={() => {
					state$.isEmojiPickerOpen.set(false);
				}}
			/>
		</>
	);
});

const CategoryNameRow = observer(
	({
		state$,
		colorSheetRef,
		addCategory,
	}: {
		state$: CategoryState;
		colorSheetRef: React.RefObject<BottomSheet | null>;
		addCategory: () => void;
	}) => {
		const openColorPicker = () => {
			colorSheetRef.current?.snapToIndex(0);
		};

		const handleTextChange = (text: string) => {
			state$.name.set(text);
		};

		return (
			<View className="flex-row items-center p-2 self-stretch my-6 gap-2">
				<Pressable
					className="w-10 h-10 rounded-md border border-gray-300"
					style={{ backgroundColor: state$.color.get() }}
					onPress={openColorPicker}
				/>
				<Input
					className="flex-1"
					placeholder={"Category name"}
					onChangeText={handleTextChange}
				/>
				<Pressable className="justify-center p-2" onPress={addCategory}>
					<PlusSquare size={32} color="black" />
				</Pressable>
			</View>
		);
	},
);

const ColorPickerSheet = observer(
	({
		state$,
		colorSheetRef,
		colors,
	}: {
		state$: CategoryState;
		colorSheetRef: React.RefObject<BottomSheet | null>;
		colors: string[];
	}) => {
		const handleConfirm = () => {
			colorSheetRef.current?.close?.();
		};

		const onColorSelected = ({ rgb }: { rgb: string }) => {
			state$.color.set(rgb);
		};

		return (
			<BottomSheet
				ref={colorSheetRef}
				snapPoints={["75%"]}
				index={-1}
				bottomInset={46}
				enablePanDownToClose
			>
				<BottomSheetView style={styles.flex}>
					<View className="p-4 flex-1 justify-between">
						<ColorPicker
							style={{ flex: 1 }}
							sliderThickness={25}
							thumbSize={24}
							thumbShape="circle"
							thumbAnimationDuration={100}
							adaptSpectrum
							boundedThumb
							value={state$.color.get()}
							onComplete={onColorSelected}
						>
							<Panel5 style={styles.panelStyle} />
							<Swatches
								style={styles.swatchesContainer}
								swatchStyle={styles.swatchStyle}
								colors={colors}
							/>
							<OpacitySlider style={styles.sliderStyle} />
						</ColorPicker>
						<Button onPress={handleConfirm} className="bg-green-500">
							<Text className="text-white">{"Pick"}</Text>
						</Button>
					</View>
				</BottomSheetView>
			</BottomSheet>
		);
	},
);

const AddCategory = () => {
	const colorSheetRef = useRef<BottomSheet>(null);
	const state$ = rootStore.categoryModel.category;

	return (
		<View className="flex-1 px-2 items-center">
			<CategoryType state$={state$} />
			<Emoji state$={state$} />
			<CategoryNameRow
				state$={state$}
				colorSheetRef={colorSheetRef}
				addCategory={rootStore.categoryModel.create}
			/>
			<ColorPickerSheet
				colorSheetRef={colorSheetRef}
				state$={state$}
				colors={rootStore.categoryModel.colors}
			/>
		</View>
	);
};

export default AddCategory;

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	panelStyle: {
		borderRadius: 16,
		height: 200,
		marginBottom: 20,
	},
	sliderStyle: {
		borderRadius: 20,
		marginTop: 20,
		marginBottom: 20,

		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,

		elevation: 5,
	},
	swatchesContainer: {
		paddingTop: 20,
		marginTop: 20,
		borderTopWidth: 1,
		borderColor: "#bebdbe",
		alignItems: "center",
		flexWrap: "nowrap",
		gap: 10,
	},
	swatchStyle: {
		borderRadius: 20,
		height: 30,
		width: 30,
		margin: 0,
		marginBottom: 0,
		marginHorizontal: 0,
		marginVertical: 0,
	},
});
