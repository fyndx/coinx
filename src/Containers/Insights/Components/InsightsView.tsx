import type { InsightsModel } from "@/src/LegendState/Insights/Insights.model";
import { observer } from "@legendapp/state/react";
import { View } from "react-native";
import { Text } from "@/src/Components/ui/Text";

export const InsightsView = observer(
	({ insightsModel$ }: { insightsModel$: InsightsModel }) => {
		return (
			<View>
				<View className="flex-row justify-between">
					<View>
						<Text>{insightsModel$.insightsData.durationText.get()}</Text>
						<Text>{insightsModel$.insightsData.netTotal.get()}</Text>
					</View>
					<View className="items-end">
						<Text>
							{insightsModel$.insightsData.spentDurationHeading.get()}
						</Text>
						<Text>{insightsModel$.insightsData.spentPerDuration.get()}</Text>
					</View>
				</View>
			</View>
		);
	},
);

