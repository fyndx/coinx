import { observer } from "@legendapp/state/react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { MotiView } from "moti";
import { useState } from "react";
import { Modal, View } from "react-native";

import type {
  TimeRangeOptions,
  TransactionsScreenModel,
} from "@/src/LegendState/TransactionsScreen.model";

import { useResolvedTheme } from "@/src/hooks/useResolvedTheme";

import { dayjsLocaleDataInstance } from "../utils/date";
import { Button } from "./ui/Button";
import { Text } from "./ui/Text";

const MONTHS = dayjsLocaleDataInstance.monthsShort();

interface MonthYearPickerProps {
  transactionsScreenModel$: TransactionsScreenModel;
}

export const MonthYearPicker = observer(
  ({ transactionsScreenModel$ }: MonthYearPickerProps) => {
    const { isDark } = useResolvedTheme();
    const iconColor = isDark ? "#ffffff" : "#09090b";
    const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
    const [selectedYear, setSelectedYear] = useState(dayjs().year());
    const [tempYear, setTempYear] = useState(selectedYear);
    const [modalVisible, setModalVisible] = useState(false);
    const [showContent, setShowContent] = useState(false);

    const openPicker = () => {
      setModalVisible(true);
      setShowContent(true);
    };

    const closePicker = () => {
      setShowContent(false);
      // setModalVisible(false) is called by onDidAnimate when the fade-out completes
    };

    const handleMonthChange = ({
      month,
      index,
    }: {
      month: string;
      index: number;
    }) => {
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
          <ChevronLeft size={24} color={iconColor} />
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
            from={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ type: "timing", duration: 200 }}
            onDidAnimate={(styleProp, finished, _, { attemptedValue }) => {
              if (styleProp === "opacity" && finished && attemptedValue === 0) {
                setModalVisible(false);
              }
            }}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <MotiView
              from={{ opacity: 0, scale: 0.92 }}
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
                    <ChevronLeft size={20} color={iconColor} />
                  </Button>
                  <Text className="text-lg font-bold">{tempYear}</Text>
                  <Button
                    variant="ghost"
                    size="icon"
                    onPress={() => setTempYear(tempYear + 1)}
                  >
                    <ChevronRight size={20} color={iconColor} />
                  </Button>
                </View>
                <View className="flex-row flex-wrap justify-center gap-2">
                  {MONTHS.map((month, index) => (
                    <Button
                      key={month}
                      variant={
                        index === selectedMonth && tempYear === selectedYear
                          ? "default"
                          : "ghost"
                      }
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
          <ChevronRight size={24} color={iconColor} />
        </Button>
      </View>
    );
  },
);
