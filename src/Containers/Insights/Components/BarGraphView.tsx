import LatoRegular from "@/assets/fonts/Lato/Lato-Regular.ttf";
import type { InsightsModel } from "@/src/LegendState/Insights/Insights.model";
import { observer } from "@legendapp/state/react";
import { LinearGradient, useFont, vec } from "@shopify/react-native-skia";
import { YStack } from "tamagui";
import { Bar, CartesianChart } from "victory-native";

export const BarGraphView = observer(
	({ insightsModel$ }: { insightsModel$: InsightsModel }) => {
		const font = useFont(LatoRegular, 12);
		const graphData = insightsModel$.durationGraphData.get();
		return (
			<YStack height={275}>
				<CartesianChart
					data={graphData}
					xKey={"day"}
					yKeys={["total"]}
					domainPadding={{ left: 10, right: 10, top: 30, bottom: 0 }}
					axisOptions={{
						font,
						tickCount: { x: 5, y: 6 },
						// lineColor: "transparent",
					}}
				>
					{({ points, chartBounds }) => (
						<>
							<Bar
								chartBounds={chartBounds} // 👈 chartBounds is needed to know how to draw the bars
								points={points.total} // 👈 points is an object with a property for each yKey
								roundedCorners={{
									topLeft: 5,
									topRight: 5,
								}}
								barCount={points.total.length}
								animate={{ type: "timing" }}
							>
								<LinearGradient
									start={vec(0, 0)}
									end={vec(0, 400)}
									colors={["#a78bfa", "#a78bfa50"]}
								/>
							</Bar>
						</>
					)}
				</CartesianChart>
			</YStack>
		);
	},
);
