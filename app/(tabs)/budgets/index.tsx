import { Construction } from "@tamagui/lucide-icons";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { H1, Text, YStack } from "tamagui";

const Budgets = () => {
	return (
		<SafeAreaView style={styles.container}>
			<YStack flex={1} justifyContent={"center"}>
				<Construction
					alignSelf={"center"}
					size={"$4"}
					color={"$color.yellow8Light"}
				/>
				<H1 textAlign={"center"}>{"Coming Soon"}</H1>
				<Text textAlign={"center"}>
					{"This feature is currently in development"}
				</Text>
			</YStack>
		</SafeAreaView>
	);
};

export default Budgets;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
