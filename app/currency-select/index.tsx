import { appModel } from "@/src/LegendState/AppState/App.model";
import { observer } from "@legendapp/state/react";
import { ChevronRightCircle } from "lucide-react-native";
import { Link } from "expo-router";
import { useRef } from "react";
import { View, Pressable } from "react-native";
import {
	CurrencyPicker,
	type CurrencyPickerRef,
} from "rn-currency-picker";
import { Text } from "@/src/Components/ui/Text";

const CurrencySelect = observer(() => {
	const currencyPickerRef = useRef<CurrencyPickerRef>();

	const handleCurrencySelect = (data: any) => {
		if (!data || !data.symbol) {
			console.error("Invalid currency data received");
			return;
		}
		appModel.actions.setCurrency(data);
	};

	return (
		<View className="flex-1 items-center gap-3 p-4">
			<View className="flex-1" />
			<Text className="text-xl font-bold text-center">{"Select Currency"}</Text>
			<CurrencyPicker
				currencyPickerRef={(ref: any) => {
					currencyPickerRef.current = ref;
				}}
				enable={true}
				containerStyle={{
					container: {
						borderWidth: 1,
						padding: 12,
						justifyContent: "center",
						borderRadius: 8,
						borderColor: "#e5e7eb",
					},
				}}
				onSelectCurrency={handleCurrencySelect}
			/>
			<View className="flex-1" />
			<View className="self-end px-6">
				<Link
					href={"/(tabs)/transactions"}
					replace={true}
					disabled={appModel.obs.currency.get() === undefined}
					asChild
				>
					<Pressable>
						<ChevronRightCircle size={32} color={appModel.obs.currency.get() === undefined ? "gray" : "black"} />
					</Pressable>
				</Link>
			</View>
			<View className="h-4" />
		</View>
	);
});

export default CurrencySelect;

