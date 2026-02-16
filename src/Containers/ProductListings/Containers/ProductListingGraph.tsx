import LatoRegular from "@/assets/fonts/Lato/Lato-Regular.ttf";
import type { ProductsListingHistoryModel } from "@/src/LegendState/ProductListingHistory/ProductListingHistory.model";
import { observer } from "@legendapp/state/react";
import { Circle, Text as SkiaText, useFont } from "@shopify/react-native-skia";
import { Fragment } from "react";
import { type SharedValue, useDerivedValue } from "react-native-reanimated";
import { View } from "react-native";
import { Text } from "@/src/Components/ui/Text";
import { CartesianChart, Line, useChartPressState } from "victory-native";

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
	productListingHistoryModel$: ProductsListingHistoryModel;
}

export const ProductListingGraph = observer(
	(props: ProductListingGraphProps) => {
		const font = useFont(LatoRegular, 12);
		const { data, graphData, productListingNames, colors } =
			props.productListingHistoryModel$.productsListingHistory;
		const extractedGraphData = graphData.get();
		const extractedProducts = productListingNames.get();
		const extractedProductListingColors = colors.get();

		const yState = extractedProducts?.reduce(
			(acc: { [key: string]: number }, curVal: string) => {
				acc[curVal] = 0;
				return acc;
			},
			{} as Record<string, number>,
		);

		const { state, isActive } = useChartPressState({
			x: 0,
			y: yState,
		} as never);

		if (extractedGraphData?.length === 0) {
			return (
				<View className="items-center justify-center p-4">
					<Text>No data available</Text>
				</View>
			);
		}

		const { minimum: minPrice, maximum: maxPrice } =
			props.productListingHistoryModel$.getMinMaxPrice.get();

		return (
			<View className="h-[300px] w-full">
				<CartesianChart
					data={extractedGraphData}
					xKey={"recordedAt"}
					yKeys={extractedProducts as never}
					chartPressState={state as never}
					domain={{ y: [minPrice, maxPrice] }}
					domainPadding={{ right: 30, left: 30 }}
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
							<Fragment key={key}>
								<Line
									connectMissingData
									key={key}
									points={(points as never)[key]}
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
							</Fragment>
						));
					}}
				</CartesianChart>
			</View>
		);
	},
);
