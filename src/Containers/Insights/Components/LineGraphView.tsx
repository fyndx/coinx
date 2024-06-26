import type { InsightsModel } from "@/src/LegendState/Insights/Insights.model";
import { observer } from "@legendapp/state/react";
import { ScrollView, Square, Stack, Text, YStack, XStack } from "tamagui";

export const LineGraphView = observer(
	({ insightsModel$ }: { insightsModel$: InsightsModel }) => {
		const categoriesGraphData = insightsModel$.categoriesGraphData.get();
		return (
			<YStack>
				<XStack>
					{categoriesGraphData.map((category, index) => {
						const padding = 1; // 1% padding
						const adjustedWidth =
							category.percentage -
							(index === 0 || index === categoriesGraphData.length - 1
								? 0
								: 2 * padding);

						// Skip rendering if the adjusted width is less than or equal to 0
						if (adjustedWidth <= 0) {
							return null;
						}

						return (
							<Stack
								key={category.id}
								style={{
									backgroundColor: category.color,
									width: `${adjustedWidth}%`, // Use adjusted width directly
									height: 20,
									marginLeft: index === 0 ? 0 : `${padding}%`, // No margin left for the first item
									marginRight:
										index === categoriesGraphData.length - 1
											? 0
											: `${padding}%`, // No margin right for the last item
								}}
							/>
						);
					})}
				</XStack>

				<ScrollView horizontal={true} contentContainerStyle={{ flexGrow: 1 }}>
					{categoriesGraphData.map((category) => (
						<XStack
							key={category.id}
							paddingHorizontal={"$2"}
							alignItems={"center"}
						>
							<Square backgroundColor={category.color} size={"$0.75"} />
							<Text paddingLeft={"$2"}>{category.name}</Text>
							<Text paddingHorizontal={"$2"}>{category.percentage}</Text>
						</XStack>
					))}
				</ScrollView>
			</YStack>
		);
	},
);
