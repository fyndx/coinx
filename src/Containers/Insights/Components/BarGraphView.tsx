import type { InsightsModel } from "@/src/LegendState/Insights/Insights.model";
import { observer } from "@legendapp/state/react";
import { LinearGradient, vec } from "@shopify/react-native-skia";
import { Bar, CartesianChart } from "victory-native";

const data = Array.from({ length: 6 }, (_, index) => ({
	// Starting at 1 for Jaunary
	month: index + 1,
	// Randomizing the listen count between 100 and 50
	listenCount: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
}));

export const BarGraphView = observer(
	({ insightsModel$ }: { insightsModel$: InsightsModel }) => {
		return (
			<CartesianChart
				data={insightsModel$.graphData.get()}
				xKey={"day"}
				yKeys={["total"]}
				domainPadding={{ left: 20, right: 20, top: 30 }}
			>
				{({ points, chartBounds }) => (
					<Bar
						chartBounds={chartBounds} // 👈 chartBounds is needed to know how to draw the bars
						points={points.total} // 👈 points is an object with a property for each yKey
					>
						<LinearGradient
							start={vec(0, 0)}
							end={vec(0, 400)}
							colors={["#a78bfa", "#a78bfa50"]}
						/>
					</Bar>
				)}
			</CartesianChart>
		);
	},
);
