import type { ProductsListingsModel } from "@/src/LegendState/ProductsListings.model";
import type { ObservableComputed } from "@legendapp/state";
import { Switch, observer } from "@legendapp/state/react";
import { useMemo } from "react";
import {
	Button,
	ScrollView,
	Text,
	XStack,
	YStack,
	getTokens,
	useTheme,
} from "tamagui";

interface ProductListingTable {
	head: string[];
	data: {
		type: "text" | "button";
		value: string | null;
		onPress?: () => void;
	}[][];
}

interface ProductListingTableProps {
	data: ObservableComputed<ProductListingTable>;
}

// Helper function to calculate max widths for each column
const calculateColumnWidths = ({ head, data }: ProductListingTable) => {
	const MIN_CELL_WIDTH = 100;
	const MAX_CELL_WIDTH = 200;
	const CHAR_WIDTH_MULTIPLIER = 10;

	const columnWidths = head.map(
		(header) => header.length * CHAR_WIDTH_MULTIPLIER,
	); // Initialize with header width

	for (const row of data) {
		for (const [index, cell] of row.entries()) {
			const cellWidth = Math.max(
				MIN_CELL_WIDTH,
				Math.min(
					(cell?.value?.length ?? 10) * CHAR_WIDTH_MULTIPLIER,
					MAX_CELL_WIDTH,
				),
			); // Adjust multiplier as needed
			if (cellWidth > columnWidths[index]) {
				columnWidths[index] = cellWidth;
			}
		}
	}

	return columnWidths;
};

export const ProductListingTable = observer(
	(props: ProductListingTableProps) => {
		const theme = useTheme();
		const { head, data } = props.data.get();

		// Calculate column widths once based on the data and headers
		const columnWidths = useMemo(
			() => calculateColumnWidths({ head, data }),
			[head, data],
		);

		if (data?.length === 0) {
			return (
				<YStack
					alignItems={"center"}
					justifyContent={"center"}
					role="alert"
					aria-label="No products available"
				>
					<Text>Add a few Listings</Text>
				</YStack>
			);
		}

		return (
			<YStack>
				{/* Horizontal and Vertical Scrolling Container */}
				<ScrollView horizontal>
					<ScrollView>
						{/* Table Header */}
						<XStack>
							{head.map((header, index) => (
								<YStack
									key={header}
									padding={8}
									borderColor={theme.borderColor.val}
									borderWidth={"$0.5"}
									width={columnWidths[index]}
									backgroundColor={"$background"}
								>
									<Text color={theme.color.val}>{header}</Text>
								</YStack>
							))}
						</XStack>

						{/* Table Rows */}
						{data.map((row, rowIndex) => (
							<XStack key={rowIndex}>
								{row.map((cell, cellIndex) => (
									<YStack
										key={cellIndex}
										padding={8}
										borderColor={theme.borderColor.val}
										borderWidth={"$0.5"}
										width={columnWidths[cellIndex]}
									>
										<Switch value={cell.type}>
											{{
												text: () => (
													<Text color={theme.color.val}>{cell.value}</Text>
												),
												button: () => (
													<Button
														color={theme.color.val}
														onPress={cell.onPress}
													>
														{cell.value}
													</Button>
												),
												default: () => null,
											}}
										</Switch>
									</YStack>
								))}
							</XStack>
						))}
					</ScrollView>
				</ScrollView>
			</YStack>
		);
	},
);
