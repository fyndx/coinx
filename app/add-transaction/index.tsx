import { CategoriesList } from "@/src/Components/CategoriesList";
import { rootStore } from "@/src/LegendState";
import type {
	CategoryModel,
	ICategory,
} from "@/src/LegendState/Category.model";
import type { TransactionModel } from "@/src/LegendState/Transaction.model";
import BottomSheet, {
	BottomSheetScrollView,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { observer, useMount, useUnmount } from "@legendapp/state/react";
import { CheckSquare, Delete } from "@tamagui/lucide-icons";
import { Toast, useToastController } from "@tamagui/toast";
import dayjs from "dayjs";
import { useNavigation } from "expo-router";
import { useMemo, useRef } from "react";
import {
	Dimensions,
	type GestureResponderEvent,
	KeyboardAvoidingView,
} from "react-native";
import DateTimePicker, { type DateType } from "react-native-ui-datepicker";
import {
	Button,
	Input,
	Popover,
	SizableText,
	Spacer,
	Stack,
	Text,
	ToggleGroup,
	XStack,
	YStack,
} from "tamagui";

const TransactionType = observer(
	({ transactionModel$ }: { transactionModel$: TransactionModel }) => {
		return (
			<XStack justifyContent="center" py={"$6"}>
				<ToggleGroup
					type="single"
					defaultValue={transactionModel$.transaction.selectedTransactionType.get()}
					onValueChange={(value) => {
						transactionModel$.transaction.selectedTransactionType.set(value);
					}}
					disableDeactivation
				>
					<ToggleGroup.Item value="Expense">
						<Text>{"Expense"}</Text>
					</ToggleGroup.Item>
					<ToggleGroup.Item value="Income">
						<Text>{"Income"}</Text>
					</ToggleGroup.Item>
				</ToggleGroup>
			</XStack>
		);
	},
);

const NumberButton = ({
	text,
	onPress,
}: {
	text: number | string;
	onPress: (event: GestureResponderEvent, text: number | string) => void;
}) => {
	return (
		<Button
			size={"$6"}
			width={"$9"}
			onPress={(_event) => onPress(_event, text)}
			backgroundColor={"$color.green10Light"}
			pressStyle={{ backgroundColor: "$color.green10Dark" }}
		>
			<Text color={"white"}>{text}</Text>
		</Button>
	);
};

const SubmitButton = ({ onPress }: { onPress: () => void }) => {
	return (
		<Button
			size={"$6"}
			width={"$9"}
			onPress={onPress}
			icon={CheckSquare}
			backgroundColor={"$color.green10Light"}
			pressStyle={{ backgroundColor: "$color.green10Dark" }}
			color={"white"}
		/>
	);
};

const NumberKeypad = ({
	onKeyPressed,
	onSubmit,
}: { onKeyPressed: (text: number | string) => void; onSubmit: () => void }) => {
	const handleKeyPressed = (
		_event: GestureResponderEvent,
		text: number | string,
	) => {
		onKeyPressed(text);
	};

	return (
		<YStack gap="$3">
			<XStack justifyContent="space-around">
				<NumberButton text={1} onPress={handleKeyPressed} />
				<NumberButton text={2} onPress={handleKeyPressed} />
				<NumberButton text={3} onPress={handleKeyPressed} />
			</XStack>
			<XStack justifyContent="space-around">
				<NumberButton text={4} onPress={handleKeyPressed} />
				<NumberButton text={5} onPress={handleKeyPressed} />
				<NumberButton text={6} onPress={handleKeyPressed} />
			</XStack>
			<XStack justifyContent="space-around">
				<NumberButton text={7} onPress={handleKeyPressed} />
				<NumberButton text={8} onPress={handleKeyPressed} />
				<NumberButton text={9} onPress={handleKeyPressed} />
			</XStack>
			<XStack justifyContent="space-around">
				<NumberButton text={0} onPress={handleKeyPressed} />
				<NumberButton text={"."} onPress={handleKeyPressed} />
				<SubmitButton onPress={onSubmit} />
			</XStack>
		</YStack>
	);
};

const CategoryAndDateButtons = observer(
	({
		transactionModel$,
		dateSheetRef,
		categorySheetRef,
	}: {
		transactionModel$: TransactionModel;
		dateSheetRef: any;
		categorySheetRef: any;
	}) => {
		const openDatepicker = () => {
			dateSheetRef.current.snapToIndex(0);
		};

		const openCategoryPicker = () => {
			categorySheetRef.current.snapToIndex(0);
		};

		const rawCategory = transactionModel$.transaction.categoryName.get();

		const category = rawCategory ? rawCategory : "Category";

		return (
			<XStack gap="$3">
				<Button
					flex={3}
					variant="outlined"
					backgroundColor={"$color.green10Light"}
					pressStyle={{ backgroundColor: "$color.green10Dark" }}
					onPress={openDatepicker}
				>
					<SizableText color={"white"}>
						{transactionModel$.transaction.date.get().format("ddd D MMM")}
					</SizableText>
				</Button>
				<Button
					flex={2}
					variant="outlined"
					backgroundColor={"$color.green10Light"}
					pressStyle={{ backgroundColor: "$color.green10Dark" }}
					onPress={openCategoryPicker}
				>
					<SizableText color={"white"}>{category}</SizableText>
				</Button>
			</XStack>
		);
	},
);

const DatePicker = observer(
	({
		transactionModel$,
		dateSheetRef,
	}: { transactionModel$: TransactionModel; dateSheetRef: any }) => {
		const snapPoints = useMemo(() => ["50%"], []);

		const handleValueChange = (value: { date: DateType }) => {
			console.log("Value changed", value);
			transactionModel$.transaction.date.set(dayjs(value.date));
			dateSheetRef.current.close();
		};

		return (
			<BottomSheet ref={dateSheetRef} snapPoints={snapPoints} index={-1}>
				<BottomSheetView>
					<Stack>
						<DateTimePicker
							mode={"single"}
							date={transactionModel$.transaction.date.get()}
							onChange={handleValueChange}
						/>
					</Stack>
				</BottomSheetView>
			</BottomSheet>
		);
	},
);

const CategoryPicker = observer(
	({
		transactionModel$,
		categoryModel$,
		categorySheetRef,
	}: {
		transactionModel$: TransactionModel;
		categoryModel$: CategoryModel;
		categorySheetRef: any;
	}) => {
		const onCategoryPressed = async (category: ICategory) => {
			// console.log("Pressed category", id);
			// const category = await categoryModel$.getCategoryByIdAsync(id);
			// transactionModel$.transaction.category.set(category);
			transactionModel$.transaction.categoryId.set(category.id);
			transactionModel$.transaction.categoryName.set(category.name);
			categorySheetRef.current.close();
		};

		return (
			<BottomSheet
				ref={categorySheetRef}
				snapPoints={["80%"]}
				index={-1}
				enablePanDownToClose
			>
				<BottomSheetScrollView>
					<CategoriesList
						categories={rootStore.categoryModel.categories}
						onCategoryPressed={onCategoryPressed}
						onCategoryDelete={() => {}}
					/>
				</BottomSheetScrollView>
			</BottomSheet>
		);
	},
);

const TransactionInput = observer(
	({ transactionModel$ }: { transactionModel$: TransactionModel }) => {
		return (
			<XStack>
				<Spacer size={"$5"} />
				<XStack flex={1} alignItems="center" justifyContent="center" space="$2">
					<SizableText theme="alt1" size={"$4"}>
						$
					</SizableText>
					<SizableText size={"$8"}>
						{transactionModel$.transaction.amount.get()}
					</SizableText>
				</XStack>
				<Button
					icon={<Delete size={"$1"} />}
					onPress={transactionModel$.clear}
				/>
			</XStack>
		);
	},
);

const Note = observer(
	({ transactionModel$ }: { transactionModel$: TransactionModel }) => {
		return (
			<Input
				size={"$5"}
				placeholder={"Note"}
				width={"$16"}
				textAlign="center"
				onChangeText={transactionModel$.transaction.note.set}
			/>
		);
	},
);

const AddTransaction = () => {
	const dateSheetRef = useRef<BottomSheet>(null);
	const categorySheetRef = useRef<BottomSheet>(null);
	const transactionModel$ = rootStore.transactionModel;
	const categoryModel$ = rootStore.categoryModel;
	const navigation = useNavigation();

	const toast = useToastController();

	useMount(() => {
		categoryModel$.getCategoriesList({
			type: transactionModel$.transaction.selectedTransactionType.peek(),
		});
		transactionModel$.onMount({ categoryModel$ });
	});

	useUnmount(() => {
		transactionModel$.onUnmount();
	});

	const handleKeyPressed = (text) => {
		transactionModel$.setAmount(text);
	};

	const handleSubmit = async () => {
		try {
			if (transactionModel$.transaction.amount.peek() === "0") {
				toast.show("Please enter an amount", {
					native: true,
				});
				return;
			}
			if (!transactionModel$.transaction.categoryId.peek()) {
				toast.show("Please select a category", {
					native: true,
				});
				return;
			}

			await transactionModel$.createTransaction();
			toast.show("Transaction created", {
				native: true,
			});
			navigation.goBack();
		} catch (error) {
			console.log("Error", error);
		}
	};

	return (
		<YStack
			paddingHorizontal="$4"
			flex={1}
			justifyContent="space-between"
			// The below is a workaround for the keyboard moving views up when the keyboard is open
			// https://github.com/expo/expo/issues/7589#issuecomment-629863678
			minHeight={Math.round(Dimensions.get("window").height)}
		>
			<TransactionType transactionModel$={transactionModel$} />
			<Stack flex={1} justifyContent="center" gap="$4" alignItems="center">
				<TransactionInput transactionModel$={transactionModel$} />
				<Note transactionModel$={transactionModel$} />
			</Stack>
			<CategoryAndDateButtons
				transactionModel$={transactionModel$}
				dateSheetRef={dateSheetRef}
				categorySheetRef={categorySheetRef}
			/>
			<Stack paddingVertical="$4">
				<NumberKeypad onKeyPressed={handleKeyPressed} onSubmit={handleSubmit} />
			</Stack>
			<DatePicker
				transactionModel$={transactionModel$}
				dateSheetRef={dateSheetRef}
			/>
			<CategoryPicker
				transactionModel$={transactionModel$}
				categoryModel$={categoryModel$}
				categorySheetRef={categorySheetRef}
			/>
		</YStack>
	);
};

export default AddTransaction;
