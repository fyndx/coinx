import {
	exportData,
	exportDataToCsv,
} from "@/src/LegendState/Settings/Settings.model";
import { authModel } from "@/src/LegendState/Auth/Auth.model";
import { SyncSection } from "@/src/Components/SyncSection";
import { ChevronRight, LogIn, LogOut, User } from "lucide-react-native";
import * as Application from "expo-application";
import { Link, router } from "expo-router";
import { Fragment } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/src/Components/ui/Text";
import { Button } from "@/src/Components/ui/Button";
import { observer } from "@legendapp/state/react";

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
	<Pressable onPress={onPress}>
		<View className="bg-background p-4 flex-row justify-between items-center bg-card rounded-lg mb-1">
			<Text className="text-lg">{title}</Text>
			<View className="flex-row items-center">
				{subTitle && (
					<Text className="text-muted-foreground mr-2">{subTitle}</Text>
				)}
				{icon && <ChevronRight size={20} color="gray" />}
			</View>
		</View>
	</Pressable>
);

const AccountSection = observer(() => {
	const isAuthenticated = authModel.obs.isAuthenticated.get();
	const user = authModel.obs.user.get();
	const isLoading = authModel.obs.isLoading.get();

	if (!isAuthenticated) {
		return (
			<View className="bg-card rounded-lg p-4 mb-1">
				<View className="flex-row items-center mb-3">
					<User size={20} color="gray" />
					<Text className="text-lg ml-2">Account</Text>
				</View>
				<Text className="text-muted-foreground text-sm mb-3">
					Sign in to sync your data across devices
				</Text>
				<Button
					variant="default"
					size="sm"
					onPress={() => router.push("/(auth)/sign-in")}
				>
					Sign In
				</Button>
			</View>
		);
	}

	return (
		<View className="bg-card rounded-lg p-4 mb-1">
			<View className="flex-row items-center mb-1">
				<User size={20} color="gray" />
				<Text className="text-lg ml-2">Account</Text>
			</View>
			<Text className="text-muted-foreground text-sm mb-3">
				{user?.email}
			</Text>
			<Button
				variant="outline"
				size="sm"
				onPress={() => authModel.actions.signOut()}
				loading={isLoading}
			>
				Sign Out
			</Button>
		</View>
	);
});

const Settings = observer(() => {
	const isAuthenticated = authModel.obs.isAuthenticated.get();

	return (
		<View className="p-2 flex-1">
			<Text className="text-xl font-bold text-center mb-4">{"Settings"}</Text>
			<View className="py-2">
				{/* Account */}
				<AccountSection />
				<View className="h-[1px] bg-border my-1" />

				{/* Sync - only show when authenticated */}
				{isAuthenticated && (
					<>
						<SyncSection />
						<View className="h-[1px] bg-border my-1" />
					</>
				)}

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
});

export default Settings;
