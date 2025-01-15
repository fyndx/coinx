import type { ObservableComputed } from "@legendapp/state";
import { Switch, observer } from "@legendapp/state/react";
import { useMemo, useRef } from "react";
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

		const stickyScrollRef = useRef<ScrollView>(null);
		const mainScrollRef = useRef<ScrollView>(null);
		const isStickyScrolling = useRef(false);
		const isMainScrolling = useRef(false);

		// Calculate column widths once based on the data and headers
		const columnWidths = useMemo(
			() => calculateColumnWidths({ head, data }),
			[head, data],
		);

		const handleStickyScroll = (event: any) => {
			if (mainScrollRef.current && !isMainScrolling.current) {
				mainScrollRef.current.scrollTo({
					y: event.nativeEvent.contentOffset.y,
					animated: false,
				});
			}
		};

		const handleMainScroll = (event: any) => {
			if (stickyScrollRef.current && !isStickyScrolling.current) {
				stickyScrollRef.current.scrollTo({
					y: event.nativeEvent.contentOffset.y,
					animated: false,
				});
			}
		};

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

		const renderCell = (cell: (typeof data)[0][0], isSticky = false) => (
			<Switch value={cell.type}>
				{{
					text: () => <Text color={theme.color.val}>{cell.value}</Text>,
					button: () => (
						<Button color={theme.color.val} onPress={cell.onPress}>
							{cell.value}
						</Button>
					),
					default: () => null,
				}}
			</Switch>
		);

		return (
			<YStack maxHeight={400}>
				<XStack>
					{/* Sticky First Column */}
					<YStack zIndex={1} backgroundColor={"$background"}>
						<YStack
							padding={8}
							borderColor={theme.borderColor.val}
							borderWidth={"$0.5"}
							width={columnWidths[0]}
						>
							<Text color={theme.color.val}>{head[0]}</Text>
						</YStack>
						<ScrollView
							ref={stickyScrollRef}
							onScrollBeginDrag={() => {
								isStickyScrolling.current = true;
							}}
							onMomentumScrollEnd={() => {
								isStickyScrolling.current = false;
							}}
							onScroll={handleStickyScroll}
							scrollEventThrottle={16}
							showsVerticalScrollIndicator={false}
						>
							{data.map((row, rowIndex) => (
								<YStack
									key={`sticky-${rowIndex}`}
									padding={8}
									borderColor={theme.borderColor.val}
									borderWidth={"$0.5"}
									width={columnWidths[0]}
									height={"$6"}
								>
									{renderCell(row[0], true)}
								</YStack>
							))}
						</ScrollView>
					</YStack>

					{/* Scrollable Remaining Columns */}
					<ScrollView horizontal>
						<YStack>
							<XStack>
								{head.slice(1).map((header, index) => (
									<YStack
										key={header}
										padding={8}
										borderColor={theme.borderColor.val}
										borderWidth={"$0.5"}
										width={columnWidths[index + 1]}
										backgroundColor={"$background"}
									>
										<Text color={theme.color.val}>{header}</Text>
									</YStack>
								))}
							</XStack>
							<ScrollView
								ref={mainScrollRef}
								onScroll={handleMainScroll}
								scrollEventThrottle={16}
								showsVerticalScrollIndicator={false}
								onScrollBeginDrag={() => {
									isMainScrolling.current = true;
								}}
								onMomentumScrollEnd={() => {
									isMainScrolling.current = false;
								}}
							>
								{data.map((row, rowIndex) => (
									<XStack key={rowIndex}>
										{row.slice(1).map((cell, cellIndex) => (
											<YStack
												key={cellIndex}
												padding={8}
												borderColor={theme.borderColor.val}
												borderWidth={"$0.5"}
												width={columnWidths[cellIndex + 1]}
												height={"$6"}
											>
												{renderCell(cell)}
											</YStack>
										))}
									</XStack>
								))}
							</ScrollView>
						</YStack>
					</ScrollView>
				</XStack>
			</YStack>
		);
	},
);
