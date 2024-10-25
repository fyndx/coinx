import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import dayjs from "dayjs";
import { useState } from "react";
import {
	Button,
	Dialog,
	Input,
	Label,
	Popover,
	Text,
	XStack,
	YStack,
} from "tamagui";
import { dayjsLocaleDataInstance } from "../utils/date";

const MONTHS = dayjsLocaleDataInstance.monthsShort();

interface MonthYearPickerProps {
	onChange: ({ month, year }: { month: number; year: number }) => void;
}

export const MonthYearPicker = ({ onChange }: MonthYearPickerProps) => {
	const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
	const [selectedYear, setSelectedYear] = useState(dayjs().year());
	const [tempYear, setTempYear] = useState(selectedYear);

	const openPicker = () => {};

	return (
		<XStack justifyContent={"space-between"} alignSelf={"stretch"}>
			<Button icon={ChevronLeft} />
			<Popover placement={"bottom"}>
				<Popover.Trigger asChild>
					<Button onPress={openPicker}>
						<Text>{`${MONTHS[selectedMonth]} ${selectedYear}`}</Text>
					</Button>
				</Popover.Trigger>
				<Popover.Content
					borderWidth={1}
					borderColor="$borderColor"
					enterStyle={{ y: -10, opacity: 0 }}
					exitStyle={{ y: -10, opacity: 0 }}
					elevate
					animation={[
						"quick",
						{
							opacity: {
								overshootClamping: true,
							},
						},
					]}
					marginHorizontal={"$6"}
				>
					<Popover.Arrow borderWidth={1} borderColor="$borderColor" />
					<YStack>
						{/* Year Row */}
						<XStack justifyContent={"space-between"} alignItems={"center"}>
							<Button
								onPress={() => {
									setTempYear(tempYear - 1);
								}}
							>
								<ChevronLeft />
							</Button>
							<Text>{tempYear}</Text>
							<Button
								onPress={() => {
									setTempYear(tempYear + 1);
								}}
							>
								<ChevronRight />
							</Button>
						</XStack>
						<XStack gap={"$2"} flexWrap={"wrap"} justifyContent={"center"}>
							{MONTHS.map((month, index) => (
								<Popover.Close asChild key={month}>
									<Button
										key={month}
										onPress={() => {
											setSelectedMonth(index);
											setSelectedYear(tempYear);
											onChange({ month: index, year: selectedYear });
										}}
										backgroundColor={
											index === selectedMonth ? "$background" : "transparent"
										}
									>
										<Text fontSize={"$5"}>{month}</Text>
									</Button>
								</Popover.Close>
							))}
						</XStack>
					</YStack>
				</Popover.Content>
			</Popover>
			<Button icon={ChevronRight} />
		</XStack>
	);
};
