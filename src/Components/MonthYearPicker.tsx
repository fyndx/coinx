import type {
	TimeRangeOptions,
	TransactionsScreenModel,
} from "@/src/LegendState/TransactionsScreen.model";
import { observer } from "@legendapp/state/react";
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
	transactionsScreenModel$: TransactionsScreenModel;
}

export const MonthYearPicker = observer(
	({ transactionsScreenModel$ }: MonthYearPickerProps) => {
		const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
		const [selectedYear, setSelectedYear] = useState(dayjs().year());
		const [tempYear, setTempYear] = useState(selectedYear);

		const openPicker = () => {};

		const handleMonthChange = ({
			month,
			index,
		}: { month: string; index: number }) => {
			setSelectedMonth(index);
			setSelectedYear(tempYear);
			const startOfMonth = dayjs().year(tempYear).month(index).startOf("month");
			const endOfMonth = dayjs().year(tempYear).month(index).endOf("month");
			const timeRange: TimeRangeOptions = {
				type: "month",
				startDate: startOfMonth.format(),
				endDate: endOfMonth.format(),
			};
			transactionsScreenModel$.obs.timeRange.set(timeRange);
		};

		const handlePreviousMonth = () => {
			const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
			const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

			setSelectedMonth(newMonth);
			setSelectedYear(newYear);
			setTempYear(newYear);

			const startOfMonth = dayjs()
				.year(newYear)
				.month(newMonth)
				.startOf("month");
			const endOfMonth = dayjs().year(newYear).month(newMonth).endOf("month");
			const timeRange: TimeRangeOptions = {
				type: "month",
				startDate: startOfMonth.format(),
				endDate: endOfMonth.format(),
			};
			transactionsScreenModel$.obs.timeRange.set(timeRange);
		};

		const handleNextMonth = () => {
			const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
			const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;

			setSelectedMonth(newMonth);
			setSelectedYear(newYear);
			setTempYear(newYear);

			const startOfMonth = dayjs()
				.year(newYear)
				.month(newMonth)
				.startOf("month");
			const endOfMonth = dayjs().year(newYear).month(newMonth).endOf("month");
			const timeRange: TimeRangeOptions = {
				type: "month",
				startDate: startOfMonth.format(),
				endDate: endOfMonth.format(),
			};
			transactionsScreenModel$.obs.timeRange.set(timeRange);
		};

		return (
			<XStack justifyContent={"space-between"} alignSelf={"stretch"}>
				<Button icon={ChevronLeft} onPress={handlePreviousMonth} />
				<Popover placement={"bottom"}>
					<Popover.Trigger asChild>
						<Button onPress={openPicker}>
							<Text>{transactionsScreenModel$.selectedTimeRange.get()}</Text>
						</Button>
					</Popover.Trigger>
					<Popover.Content marginHorizontal={"$6"}>
						<Popover.Arrow borderWidth={1} borderColor="$borderColor" />
						<YStack gap={"$3"}>
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
											onPress={() => handleMonthChange({ month, index })}
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
				<Button icon={ChevronRight} onPress={handleNextMonth} />
			</XStack>
		);
	},
);
