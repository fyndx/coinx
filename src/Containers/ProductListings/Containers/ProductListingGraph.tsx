import LatoRegular from "@/assets/fonts/Lato/Lato-Regular.ttf";
import { observer } from "@legendapp/state/react";
import { Text, YStack } from "tamagui";
import { Line, CartesianChart, useChartPressState } from "victory-native";
import type { ProductsListingHistoryModel } from "@/src/LegendState/ProductListingHistory/ProductListingHistory.model";
import { Circle, useFont, Text as SkiaText } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";

function ToolTip({
	x,
	y,
	listingName,
	price,
	index,
}: {
	x: SharedValue<number>;
	y: SharedValue<number>;
	listingName: string;
	price: SharedValue<number>;
	index: number;
}) {
	const isIndexEven = index % 2 === 0;
	const font = useFont(LatoRegular, 12);

	const tooltipNamePosition = useDerivedValue(() => {
		if (isIndexEven) {
			return {
				x: x.value,
				y: y.value + 20,
			};
		}
		return {
			x: x.value,
			y: y.value - 20,
		};
	});

	const tooltipPricePosition = useDerivedValue(() => {
		if (isIndexEven) {
			return {
				x: x.value,
				y: y.value + 30,
			};
		}
		return {
			x: x.value,
			y: y.value - 30,
		};
	});

	return (
		<>
			<Circle cx={x} cy={y} r={8} color="black" />
			<SkiaText
				x={tooltipNamePosition.value.x}
				y={tooltipNamePosition.value.y}
				text={listingName}
				font={font}
			/>
			<SkiaText
				x={tooltipPricePosition.value.x}
				y={tooltipPricePosition.value.y}
				text={`${price.value}`}
				font={font}
			/>
		</>
	);
}

interface ProductListingGraphProps {
	listingHistory: ProductsListingHistoryModel["productsListingHistory"];
}

export const ProductListingGraph = observer(
	(props: ProductListingGraphProps) => {
		const font = useFont(LatoRegular, 12);
		const { data, graphData, productListingNames, colors } =
			props.listingHistory;
		const extractedGraphData = graphData.get();
		const extractedProducts = productListingNames.get();
		const extractedProductListingColors = colors.get();
		const yState = extractedProducts?.reduce(
			(acc: { [key: string]: number }, curVal: string) => {
				acc[curVal] = 0;
				return acc;
			},
			{},
		);
		const { state, isActive } = useChartPressState({ x: 0, y: yState });

		if (extractedGraphData?.length === 0) {
			return <Text>No data available</Text>;
		}

		return (
			<YStack height={300}>
				{/* TODO: if data doesn't work use chart data */}
				<CartesianChart
					data={extractedGraphData}
					xKey={"recordedAt"}
					yKeys={extractedProducts}
					chartPressState={state}
					domainPadding={{ left: 10, right: 10, top: 30, bottom: 0 }}
					yAxis={[
						{
							font,
							tickCount: 6,
							labelOffset: 8,
						},
					]}
					xAxis={{
						font,
						tickCount: 5,
						labelOffset: 4,
						formatXLabel: (label) => {
							if (label) {
								return label;
							}
							return "";
						},
					}}
				>
					{({ points, chartBounds }) => {
						return extractedProducts.map((key, index) => (
							<>
								<Line
									connectMissingData
									key={key}
									points={points[key]}
									animate={{ type: "timing" }}
									strokeWidth={2}
									color={extractedProductListingColors[key]}
								/>
								{isActive && (
									<ToolTip
										x={state.x.position}
										y={state.y[key].position}
										listingName={key}
										price={state.y[key].value}
										index={index}
									/>
								)}
							</>
						));
					}}
				</CartesianChart>
			</YStack>
		);
	},
);
