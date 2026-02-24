import type {
	TimeRangeOptions,
	TransactionsScreenModel,
} from "@/src/LegendState/TransactionsScreen.model";
import { observer } from "@legendapp/state/react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { Modal, View } from "react-native";
import { dayjsLocaleDataInstance } from "../utils/date";
import { Button } from "./ui/Button";
import { Text } from "./ui/Text";
import { MotiView } from "moti";

const MONTHS = dayjsLocaleDataInstance.monthsShort();

interface MonthYearPickerProps {
	transactionsScreenModel$: TransactionsScreenModel;
}

export const MonthYearPicker = observer(
	({ transactionsScreenModel$ }: MonthYearPickerProps) => {
		const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
		const [selectedYear, setSelectedYear] = useState(dayjs().year());
		const [tempYear, setTempYear] = useState(selectedYear);
		const [modalVisible, setModalVisible] = useState(false);
		const [showContent, setShowContent] = useState(false);

		const openPicker = () => {
			setModalVisible(true);
			requestAnimationFrame(() => setShowContent(true));
		};

		const closePicker = () => {
			setShowContent(false);
			setTimeout(() => setModalVisible(false), 280);
		};

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
			closePicker();
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
			<View className="flex-row justify-between items-center w-full">
				<Button variant="ghost" size="icon" onPress={handlePreviousMonth}>
					<ChevronLeft size={24} color="#09090b" />
				</Button>

				<Button variant="outline" onPress={openPicker}>
					{transactionsScreenModel$.selectedTimeRange.get()}
				</Button>

				<Modal
					animationType="none"
					transparent={true}
					visible={modalVisible}
					onRequestClose={closePicker}
				>
					<MotiView
						animate={{ opacity: showContent ? 1 : 0 }}
						transition={{ type: "timing", duration: 200 }}
						style={{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
							backgroundColor: "rgba(0,0,0,0.5)",
						}}
					>
						<MotiView
							animate={{
								opacity: showContent ? 1 : 0,
								scale: showContent ? 1 : 0.92,
							}}
							transition={{ type: "spring", damping: 18, stiffness: 220 }}
							style={{ width: "80%", margin: 16 }}
						>
							<View className="bg-background p-4 rounded-2xl w-full shadow-lg border border-border">
								{/* Year Row */}
								<View className="flex-row justify-between items-center mb-4">
									<Button
										variant="ghost"
										size="icon"
										onPress={() => setTempYear(tempYear - 1)}
									>
										<ChevronLeft size={20} color="#09090b" />
									</Button>
									<Text className="text-lg font-bold">{tempYear}</Text>
									<Button
										variant="ghost"
										size="icon"
										onPress={() => setTempYear(tempYear + 1)}
									>
										<ChevronRight size={20} color="#09090b" />
									</Button>
								</View>
								<View className="flex-row flex-wrap justify-center gap-2">
									{MONTHS.map((month, index) => (
										<Button
											key={month}
											variant={index === selectedMonth ? "default" : "ghost"}
											className="w-[30%] mb-2"
											onPress={() => handleMonthChange({ month, index })}
										>
											{month}
										</Button>
									))}
								</View>
								<Button
									variant="outline"
									className="mt-4"
									onPress={closePicker}
								>
									Cancel
								</Button>
							</View>
						</MotiView>
					</MotiView>
				</Modal>

				<Button variant="ghost" size="icon" onPress={handleNextMonth}>
					<ChevronRight size={24} color="#09090b" />
				</Button>
			</View>
		);
	},
);
