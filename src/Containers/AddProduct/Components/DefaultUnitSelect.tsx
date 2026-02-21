import { MeasurementUnits } from "@/src/utils/units";
import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

interface DefaultUnitSelectProps {
	onValueChange?: (value: (typeof MeasurementUnits)[number]) => void;
	value?: string;
}

export const DefaultUnitSelect = ({
	onValueChange,
	value,
}: DefaultUnitSelectProps) => {
	const data = MeasurementUnits.map((unit) => ({ label: unit, value: unit }));

	return (
		<View className="w-full">
			<Dropdown
				style={styles.dropdown}
				placeholderStyle={styles.placeholderStyle}
				selectedTextStyle={styles.selectedTextStyle}
				inputSearchStyle={styles.inputSearchStyle}
				iconStyle={styles.iconStyle}
				data={data}
				search
				maxHeight={300}
				labelField="label"
				valueField="value"
				placeholder="Select a Unit *"
				searchPlaceholder="Search..."
				value={value}
				onChange={(item) => {
					onValueChange?.(item.value);
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	dropdown: {
		height: 50,
		backgroundColor: "transparent",
		borderBottomColor: "gray",
		borderBottomWidth: 0.5,
	},
	icon: {
		marginRight: 5,
	},
	placeholderStyle: {
		fontSize: 16,
	},
	selectedTextStyle: {
		fontSize: 16,
	},
	iconStyle: {
		width: 20,
		height: 20,
	},
	inputSearchStyle: {
		height: 40,
		fontSize: 16,
	},
});
