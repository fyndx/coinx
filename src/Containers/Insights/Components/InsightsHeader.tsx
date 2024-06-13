import type { InsightsModel } from "@/src/LegendState/Insights/Insights.model";
import { observer } from "@legendapp/state/react";
import { MenuView, type NativeActionEvent } from "@react-native-menu/menu";
import { Button, Text, XStack } from "tamagui";

const ACTIONS = [
	{
		id: "week",
		title: "week",
	},
	{
		id: "month",
		title: "month",
	},
	{
		id: "year",
		title: "year",
	},
];

export const InsightsHeader = observer(
	({ insightsModel$ }: { insightsModel$: InsightsModel }) => {
		const handleOptionChange = ({ nativeEvent }: NativeActionEvent) => {
			insightsModel$.onDurationChange({ durationType: nativeEvent.event });
		};
		return (
			<XStack justifyContent={"space-between"} alignItems={"center"}>
				<Text fontSize={"$8"}>Insights</Text>
				<MenuView actions={ACTIONS} onPressAction={handleOptionChange}>
					<Button size={"$2"} variant={"outlined"}>
						<Text>{insightsModel$.obs.durationType.get()}</Text>
					</Button>
				</MenuView>
			</XStack>
		);
	},
);
