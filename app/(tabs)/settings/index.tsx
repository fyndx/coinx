import {
	exportData,
	exportDataToCsv,
} from "@/src/LegendState/Settings/Settings.model";
import { ChevronRight } from "@tamagui/lucide-icons";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import {
	Button,
	H2,
	H3,
	H4,
	ListItem,
	Separator,
	YGroup,
	YStack,
} from "tamagui";

const Settings = () => {
	return (
		<YStack padding={"$2"}>
			<H3 textAlign={"center"}>{"Settings"}</H3>
			<YGroup paddingVertical={"$2"}>
				<YGroup.Item>
					<Link href={"/categories"} asChild>
						<ListItem title={"Categories"} iconAfter={ChevronRight} />
					</Link>
				</YGroup.Item>
				<Separator />
				<YGroup.Item>
					<ListItem title={"Export Data"} onPress={exportDataToCsv} />
				</YGroup.Item>
				{__DEV__ && (
					<>
						<Separator />
						<YGroup.Item>
							<Link href={"/playground"} asChild>
								<ListItem title={"Play Ground"} iconAfter={ChevronRight} />
							</Link>
						</YGroup.Item>
					</>
				)}
			</YGroup>
		</YStack>
	);
};

export default Settings;

const styles = StyleSheet.create({});
