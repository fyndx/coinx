import { appModel } from "@/src/LegendState/AppState/App.model";
import { Show } from "@legendapp/state/react";
import { ChevronRightCircle } from "@tamagui/lucide-icons";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import {
	CurrencyPicker,
	type CurrencyPickerRef,
	type CurrencyData,
} from "rn-currency-picker";
import { Button, H2, H4, Text, XStack, YStack } from "tamagui";

const CurrencySelect = () => {
	const currencyPickerRef = useRef<CurrencyPickerRef>();

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
				onSelectCurrency={(data: CurrencyData) => {
					appModel.actions.setCurrency(data);
				}}
			/>
			<YStack flex={1} />
			<YStack alignSelf={"flex-end"} paddingHorizontal={"$6"}>
				<Link href={"/(tabs)/transactions"}>
					<ChevronRightCircle size={"$4"} />
				</Link>
			</YStack>
			<YStack height={"$4"} />
		</YStack>
	);
};

export default CurrencySelect;
