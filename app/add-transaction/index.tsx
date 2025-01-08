import { CategoriesList } from "@/src/Components/CategoriesList";
import { rootStore } from "@/src/LegendState";
import { appModel } from "@/src/LegendState/AppState/App.model";
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
import { useLocalSearchParams, useNavigation } from "expo-router";
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
					defaultValue={transactionModel$.transaction.transactionType.get()}
					onValueChange={(value) => {
						transactionModel$.transaction.transactionType.set(
							value as "Expense" | "Income",
						);
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
						{dayjs(transactionModel$.transaction.date.get()).format(
							"ddd D MMM hh:mm a",
						)}
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
		const locale = appModel.obs.locale.get();
		const snapPoints = useMemo(() => ["50%"], []);

		const handleValueChange = (value: { date: DateType }) => {
			transactionModel$.transaction.date.set(value.date);
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
							timePicker
							displayFullDays
							locale={locale}
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
				value={transactionModel$.transaction.note.get()}
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
	const {
		id,
		amount = "0",
		transactionType,
		transactionTime: stringTransactionTime,
		categoryId: stringCategoryId,
		categoryName,
		note,
	} = useLocalSearchParams<{
		id?: string;
		amount?: string;
		transactionType?: string;
		transactionTime?: string;
		categoryId: string;
		categoryName: string;
		note: string;
	}>();

	const params = useLocalSearchParams();

	// TODO: Fix multiplying time by 1000
	const transactionTime = stringTransactionTime
		? dayjs(Number.parseInt(stringTransactionTime) * 1000)
		: dayjs();

	const categoryId = Number.parseInt(stringCategoryId);

	const toast = useToastController();

	useMount(() => {
		categoryModel$.getCategoriesList({
			type: transactionModel$.transaction.transactionType.peek(),
		});
		transactionModel$.onMount({ categoryModel$ });
		console.log("Transaction id", id);
		// Set the transaction values from the URL params if there is transaction id
		if (id) {
			transactionModel$.transaction.set({
				id: Number.parseInt(id),
				amount,
				transactionType: transactionType as "Expense" | "Income",
				date: transactionTime,
				categoryId,
				categoryName,
				note,
			});
		}
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
			toast.show("Failed to create transaction", {
				native: true,
			});
			// Optionally handle navigation error
			navigation.goBack();
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
