import type { InsightsModel } from "@/src/LegendState/Insights/Insights.model";
import { observer } from "@legendapp/state/react";
import { Text, XStack, YStack } from "tamagui";

export const InsightsView = observer(
	({ insightsModel$ }: { insightsModel$: InsightsModel }) => {
		return (
			<YStack>
				<XStack justifyContent={"space-between"}>
					<YStack>
						<Text>{insightsModel$.insightsData.durationText.get()}</Text>
						<Text>{insightsModel$.insightsData.netTotal.get()}</Text>
					</YStack>
					<YStack alignItems={"flex-end"}>
						<Text>
							{insightsModel$.insightsData.spentDurationHeading.get()}
						</Text>
						<Text>{insightsModel$.insightsData.spentPerDuration.get()}</Text>
					</YStack>
				</XStack>
			</YStack>
		);
	},
);
