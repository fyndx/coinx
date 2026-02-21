import { Text } from "@/src/Components/ui/Text";
import type { InsightsModel } from "@/src/LegendState/Insights/Insights.model";
import { observer } from "@legendapp/state/react";
import { MenuView, type NativeActionEvent } from "@react-native-menu/menu";
import { Button } from "heroui-native";
import { View } from "react-native";

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
			insightsModel$.actions.setDurationType({
				durationType: nativeEvent.event as "week" | "month" | "year",
			});
		};
		return (
			<View className="flex-row justify-between items-center">
				<Text className="text-3xl font-bold">Insights</Text>
				<MenuView actions={ACTIONS} onPressAction={handleOptionChange}>
					<Button size="sm" variant="secondary">
						<Text>{insightsModel$.obs.durationType.get()}</Text>
					</Button>
				</MenuView>
			</View>
		);
	},
);
