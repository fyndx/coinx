import {
	exportData,
	exportDataToCsv,
} from "@/src/LegendState/Settings/Settings.model";
import { ChevronRight } from "lucide-react-native";
import * as Application from "expo-application";
import { Link } from "expo-router";
import { Fragment } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/src/Components/ui/Text";

const SettingsItem = ({
	title,
	subTitle,
	icon,
	onPress,
}: {
	title: string;
	subTitle?: string;
	icon?: boolean;
	onPress?: () => void;
}) => (
	<View className="bg-background p-4 flex-row justify-between items-center bg-card rounded-lg mb-1">
		<Text className="text-lg">{title}</Text>
		<View className="flex-row items-center">
			{subTitle && (
				<Text className="text-muted-foreground mr-2">{subTitle}</Text>
			)}
			{icon && <ChevronRight size={20} color="gray" />}
		</View>
	</View>
);

const Settings = () => {
	return (
		<View className="p-2 flex-1">
			<Text className="text-xl font-bold text-center mb-4">{"Settings"}</Text>
			<View className="py-2">
				<Link href={"/categories"} asChild>
					<Pressable>
						<SettingsItem title="Categories" icon />
					</Pressable>
				</Link>
				<View className="h-[1px] bg-border my-1" />
				<Link href={"/stores"} asChild>
					<Pressable>
						<SettingsItem title="Stores" icon />
					</Pressable>
				</Link>
				<View className="h-[1px] bg-border my-1" />
				{/* <Pressable onPress={exportDataToCsv}>
          <SettingsItem title="Export Data" />
        </Pressable> */}
				{__DEV__ && (
					<Fragment>
						<View className="h-[1px] bg-border my-1" />
						<Link href={"/playground"} asChild>
							<Pressable>
								<SettingsItem title="Play Ground" icon />
							</Pressable>
						</Link>
					</Fragment>
				)}
				<View className="h-[1px] bg-border my-1" />
				{/* Version */}
				<SettingsItem
					title="Version"
					subTitle={Application.nativeApplicationVersion ?? undefined}
				/>
			</View>
		</View>
	);
};

export default Settings;

const styles = StyleSheet.create({});
