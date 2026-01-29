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
import { CheckSquare, Delete } from "lucide-react-native";
import dayjs from "dayjs";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useMemo, useRef } from "react";
import {
	Alert,
	Dimensions,
	type GestureResponderEvent,
	StyleSheet,
	View,
	Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, { type DateType } from "react-native-ui-datepicker";
import { Button } from "heroui-native";
import { Input } from "@/src/Components/ui/Input";
import { Text } from "@/src/Components/ui/Text";

const TransactionType = observer(
	({ transactionModel$ }: { transactionModel$: TransactionModel }) => {
		const type = transactionModel$.transaction.transactionType.get();
		return (
			<View className="justify-center items-center py-6">
				<View className="flex-row bg-muted rounded-md p-1">
					{["Expense", "Income"].map((value) => (
						<Pressable
							key={value}
							onPress={() =>
								transactionModel$.transaction.transactionType.set(
									value as "Expense" | "Income",
								)
							}
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
		<Pressable
			onPress={(event) => onPress(event, text)}
			className="w-24 h-16 bg-green-500 active:bg-green-700 justify-center items-center rounded-md"
		>
			<Text className="text-white text-xl font-bold">{String(text)}</Text>
		</Pressable>
	);
};

const SubmitButton = ({ onPress }: { onPress: () => void }) => {
	return (
		<Pressable
			onPress={onPress}
			className="w-24 h-16 bg-green-500 active:bg-green-700 justify-center items-center rounded-md"
		>
			<CheckSquare size={24} color="white" />
		</Pressable>
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
		<View className="gap-3">
			<View className="flex-row justify-around">
				<NumberButton text={1} onPress={handleKeyPressed} />
				<NumberButton text={2} onPress={handleKeyPressed} />
				<NumberButton text={3} onPress={handleKeyPressed} />
			</View>
			<View className="flex-row justify-around">
				<NumberButton text={4} onPress={handleKeyPressed} />
				<NumberButton text={5} onPress={handleKeyPressed} />
				<NumberButton text={6} onPress={handleKeyPressed} />
			</View>
			<View className="flex-row justify-around">
				<NumberButton text={7} onPress={handleKeyPressed} />
				<NumberButton text={8} onPress={handleKeyPressed} />
				<NumberButton text={9} onPress={handleKeyPressed} />
			</View>
			<View className="flex-row justify-around">
				<NumberButton text={0} onPress={handleKeyPressed} />
				<NumberButton text={"."} onPress={handleKeyPressed} />
				<SubmitButton onPress={onSubmit} />
			</View>
		</View>
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
			<View className="flex-row gap-3 px-4">
				<Button
					variant="outline"
					className="flex-3 bg-green-500 active:bg-green-700 border-0"
					onPress={openDatepicker}
				>
					<Text className="text-white">
						{dayjs(transactionModel$.transaction.date.get()).format(
							"ddd D MMM hh:mm a",
						)}
					</Text>
				</Button>
				<Button
					variant="outline"
					className="flex-2 bg-green-500 active:bg-green-700 border-0"
					onPress={openCategoryPicker}
				>
					<Text className="text-white">{category}</Text>
				</Button>
			</View>
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
					<View>
						<DateTimePicker
							mode={"single"}
							date={transactionModel$.transaction.date.get()}
							onChange={handleValueChange}
							timePicker
							locale={locale}
						/>
					</View>
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
			<View className="flex-row items-center justify-between px-4">
				<View className="w-5" />
				<View className="flex-1 flex-row items-center justify-center gap-2">
					<Text className="text-xl text-muted-foreground">$</Text>
					<Text className="text-5xl font-bold">
						{transactionModel$.transaction.amount.get()}
					</Text>
				</View>
				<Pressable onPress={transactionModel$.clear} className="p-2">
					<Delete size={24} color="gray" />
				</Pressable>
			</View>
		);
	},
);

const Note = observer(
	({ transactionModel$ }: { transactionModel$: TransactionModel }) => {
		return (
			<Input
				placeholder={"Note"}
				className="w-64 text-center text-lg"
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
		? dayjs(stringTransactionTime)
		: dayjs();

	const categoryId = Number.parseInt(stringCategoryId);

	useMount(() => {
		categoryModel$.getCategoriesList({
			type: transactionModel$.transaction.transactionType.peek(),
		});
		transactionModel$.onMount({ categoryModel$ });
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

	const handleKeyPressed = (text: number | string) => {
		transactionModel$.setAmount(String(text));
	};

	const handleSubmit = async () => {
		try {
			if (transactionModel$.transaction.amount.peek() === "0") {
				Alert.alert("Please enter an amount");
				return;
			}
			if (!transactionModel$.transaction.categoryId.peek()) {
				Alert.alert("Please select a category");
				return;
			}

			await transactionModel$.createTransaction();
			navigation.goBack();
		} catch (error) {
			console.log("Error", error);
			Alert.alert("Failed to create transaction");
			// Optionally handle navigation error
			navigation.goBack();
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View
				className="flex-1 px-4 justify-between"
				style={{ minHeight: Math.round(Dimensions.get("window").height) }}
			>
				<TransactionType transactionModel$={transactionModel$} />
				<View className="flex-1 justify-center gap-4 items-center">
					<TransactionInput transactionModel$={transactionModel$} />
					<Note transactionModel$={transactionModel$} />
				</View>
				<CategoryAndDateButtons
					transactionModel$={transactionModel$}
					dateSheetRef={dateSheetRef}
					categorySheetRef={categorySheetRef}
				/>
				<View className="py-4">
					<NumberKeypad
						onKeyPressed={handleKeyPressed}
						onSubmit={handleSubmit}
					/>
				</View>
				<DatePicker
					transactionModel$={transactionModel$}
					dateSheetRef={dateSheetRef}
				/>
				<CategoryPicker
					transactionModel$={transactionModel$}
					categoryModel$={categoryModel$}
					categorySheetRef={categorySheetRef}
				/>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default AddTransaction;
