import type { ObservableComputed } from "@legendapp/state";
import { Switch, observer } from "@legendapp/state/react";
import { useMemo, useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import {
	Pressable,
	ScrollView,
	View,
} from "react-native";
import { Text } from "@/src/Components/ui/Text";

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

		const handleStickyScroll = (
			event: NativeSyntheticEvent<NativeScrollEvent>,
		) => {
			if (mainScrollRef.current && !isMainScrolling.current) {
				mainScrollRef.current.scrollTo({
					y: event.nativeEvent.contentOffset.y,
					animated: false,
				});
			}
		};

		const handleMainScroll = (
			event: NativeSyntheticEvent<NativeScrollEvent>,
		) => {
			if (stickyScrollRef.current && !isStickyScrolling.current) {
				stickyScrollRef.current.scrollTo({
					y: event.nativeEvent.contentOffset.y,
					animated: false,
				});
			}
		};

		if (data?.length === 0) {
			return (
				<View
					className="items-center justify-center p-4 border border-border rounded-md"
					role="alert"
					aria-label="No products available"
				>
					<Text>Add a few Listings</Text>
				</View>
			);
		}

		const renderCell = (cell: (typeof data)[0][0]) => (
			<Switch value={cell.type}>
				{{
					text: () => <Text>{cell.value}</Text>,
					button: () => (
						<Pressable onPress={cell.onPress} className="bg-primary px-3 py-1 rounded-sm">
							<Text className="text-primary-foreground text-xs">{cell?.value ?? ""}</Text>
						</Pressable>
					),
					default: () => null,
				}}
			</Switch>
		);

		return (
			<View className="max-h-[400px] border border-border rounded-md overflow-hidden">
				<View className="flex-row">
					{/* Sticky First Column */}
					<View className="z-10 bg-background border-r border-border">
						<View
							className="p-2 border-b border-border bg-muted/20"
							style={{ width: columnWidths[0] }}
						>
							<Text className="font-semibold">{head[0]}</Text>
						</View>
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
								<View
									key={`sticky-${rowIndex}-${row[0].value}`}
									className="p-2 border-b border-border h-12 justify-center"
									style={{ width: columnWidths[0] }}
								>
									{renderCell(row[0])}
								</View>
							))}
						</ScrollView>
					</View>

					{/* Scrollable Remaining Columns */}
					<ScrollView horizontal>
						<View>
							<View className="flex-row bg-muted/20">
								{head.slice(1).map((header, index) => (
									<View
										key={header}
										className="p-2 border-r border-b border-border"
										style={{ width: columnWidths[index + 1] }}
									>
										<Text className="font-semibold">{header}</Text>
									</View>
								))}
							</View>
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
									<View key={`rowIndex-${rowIndex}`} className="flex-row">
										{row.slice(1).map((cell, cellIndex) => (
											<View
												key={`cellIndex-${cellIndex}-${cell.value}`}
												className="p-2 border-r border-b border-border h-12 justify-center"
												style={{ width: columnWidths[cellIndex + 1] }}
											>
												{renderCell(cell)}
											</View>
										))}
									</View>
								))}
							</ScrollView>
						</View>
					</ScrollView>
				</View>
			</View>
		);
	},
);

