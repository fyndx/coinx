import type { ObservableComputed } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { useMemo } from "react";
import { ScrollView, Text, XStack, YStack, getTokens, useTheme } from "tamagui";

interface ProductListingTableProps {
	data: ObservableComputed<{
		head: string[];
		data: string[][];
	}>;
}

// Helper function to calculate max widths for each column
const calculateColumnWidths = ({
	head,
	data,
}: { head: string[]; data: string[][] }) => {
	const columnWidths = head.map((header) => header.length * 10); // Initialize with header width

	for (const row of data) {
		for (const [index, cell] of row.entries()) {
			const MAX_CELL_WIDTH = 100;
			const cellWidth = Math.min(cell.length * 10, MAX_CELL_WIDTH); // Adjust multiplier as needed
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
					flex={1}
					alignItems={"center"}
					justifyContent={"center"}
					role="alert"
					aria-label="No products available"
				>
					<Text>Add a few Products</Text>
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
										<Text color={theme.color.val}>{cell}</Text>
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
