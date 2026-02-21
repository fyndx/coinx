import { Text } from "@/src/Components/ui/Text";
import type { InsightsModel } from "@/src/LegendState/Insights/Insights.model";
import { observer } from "@legendapp/state/react";
import { ScrollView, View } from "react-native";

export const LineGraphView = observer(
	({ insightsModel$ }: { insightsModel$: InsightsModel }) => {
		const categoriesGraphData = insightsModel$.categoriesGraphData.get();
		return (
			<View>
				<View className="flex-row">
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
							<View
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
				</View>

				<ScrollView
					horizontal={true}
					contentContainerStyle={{ flexGrow: 1 }}
					className="mt-2"
				>
					{categoriesGraphData.map((category) => (
						<View key={category.id} className="flex-row items-center px-2">
							<View
								style={{ backgroundColor: category.color, width: 8, height: 8 }}
							/>
							<Text className="pl-2">{category.name}</Text>
							<Text className="px-2">{category.percentage}</Text>
						</View>
					))}
				</ScrollView>
			</View>
		);
	},
);
