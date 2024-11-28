import { appModel } from "@/src/LegendState/AppState/App.model";
import { ChevronRightCircle } from "@tamagui/lucide-icons";
import { Link } from "expo-router";
import { useRef } from "react";
import {
	type CurrencyData,
	CurrencyPicker,
	type CurrencyPickerRef,
} from "rn-currency-picker";
import { H4, YStack } from "tamagui";

const CurrencySelect = () => {
	const currencyPickerRef = useRef<CurrencyPickerRef>();

	const handleCurrencySelect = (data: CurrencyData) => {
		if (!data || !data.symbol) {
			console.error("Invalid currency data received");
			return;
		}
		appModel.actions.setCurrency(data);
	};

	return (
		<YStack flex={1} alignItems={"center"} gap={"$3"}>
			<YStack flex={3} />
			<H4 textAlign={"center"}>{"Select Currency"}</H4>
			<CurrencyPicker
				currencyPickerRef={(ref) => {
					currencyPickerRef.current = ref;
				}}
				enable={true}
				containerStyle={{
					container: {
						borderWidth: 1,
						padding: 12,
						justifyContent: "center",
					},
				}}
				onSelectCurrency={handleCurrencySelect}
			/>
			<YStack flex={1} />
			<YStack alignSelf={"flex-end"} paddingHorizontal={"$6"}>
				<Link
					href={"/(tabs)/transactions"}
					replace={true}
					disabled={appModel.obs.currency.get() === undefined}
				>
					<ChevronRightCircle size={"$4"} />
				</Link>
			</YStack>
			<YStack height={"$4"} />
		</YStack>
	);
};

export default CurrencySelect;
