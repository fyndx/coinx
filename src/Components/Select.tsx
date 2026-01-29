import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Text } from "./ui/Text";

interface DefaultUnitSelectProps<T> {
	placeholder: string;
	data: T[];
	displayField?: keyof T | ((item: T) => string);
	onValueChange?: (value: string) => void;
}

export const Select = <T extends {}>({
	placeholder,
	data,
	onValueChange,
	displayField,
}: DefaultUnitSelectProps<T>) => {
	const getDisplayValue = (item: T) => {
		if (!displayField) {
			return String(item);
		}
		if (typeof displayField === "function") {
			return displayField(item);
		}
		return String(item[displayField]);
	};

	const formattedData = data.map((item) => {
		const label = getDisplayValue(item);
		return { label, value: label, original: item };
	});

	return (
		<View className="w-full">
			<Dropdown
				style={styles.dropdown}
				placeholderStyle={styles.placeholderStyle}
				selectedTextStyle={styles.selectedTextStyle}
				inputSearchStyle={styles.inputSearchStyle}
				iconStyle={styles.iconStyle}
				data={formattedData}
				search
				maxHeight={300}
				labelField="label"
				valueField="value"
				placeholder={placeholder}
				searchPlaceholder="Search..."
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
		backgroundColor: 'transparent',
		borderBottomColor: 'gray',
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

