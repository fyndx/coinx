import { observer } from "@legendapp/state/react";
import * as Application from "expo-application";
import { Link, router } from "expo-router";
import { ChevronRight, SunMoon, User, Check } from "lucide-react-native";
import { Fragment } from "react";
import { Pressable, View } from "react-native";

import { Button } from "@/src/Components/ui/Button";
import { Text } from "@/src/Components/ui/Text";
import { authModel } from "@/src/LegendState/Auth/Auth.model";
import { type ThemeMode, themeModel } from "@/src/LegendState/Theme/Theme.model";
import { SafeAreaView } from "@/src/Components/ui/SafeAreaView";

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
        {subTitle && <Text className="text-muted-foreground mr-2">{subTitle}</Text>}
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
        <Button variant="default" size="sm" onPress={() => router.push("/(auth)/sign-in")}>
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
      <Text className="text-muted-foreground text-sm mb-3">{user?.email}</Text>
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

const THEME_OPTIONS: {
  mode: ThemeMode;
  label: string;
  preview: string | null;
}[] = [
  { mode: "system", label: "System", preview: null },
  { mode: "light", label: "Light", preview: "#ffffff" },
  { mode: "dark", label: "Dark", preview: "#1a1a1a" },
];

const AppearanceSection = observer(() => {
  const currentMode = themeModel.obs.mode.get();
  return (
    <View className="bg-card rounded-lg p-4 mb-1">
      <Text className="text-base font-semibold mb-3">{"Appearance"}</Text>
      <View>
        {THEME_OPTIONS.map(({ mode, label, preview }, index) => {
          const isActive = currentMode === mode;
          const isLast = index === THEME_OPTIONS.length - 1;
          return (
            <Pressable
              key={mode}
              onPress={() => themeModel.setTheme(mode)}
              className={`flex-row items-center justify-between py-4 ${
                !isLast ? "border-b border-border" : ""
              }`}
            >
              <View className="flex-row items-center gap-3">
                {preview ? (
                  <View
                    className="w-8 h-8 rounded-full border border-border"
                    style={{ backgroundColor: preview }}
                  />
                ) : (
                  <View className="w-8 h-8 rounded-full border border-border bg-muted flex items-center justify-center">
                    <SunMoon size={16} color="gray" />
                  </View>
                )}
                <Text className="text-foreground text-base">{label}</Text>
              </View>
              {isActive && <Check size={20} className="text-primary color-primary" />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const Settings = observer(() => {
  return (
    <SafeAreaView className="p-2 flex-1">
      <Text className="text-xl font-bold text-center mb-4">{"Settings"}</Text>
      <View className="py-2">
        {/* Account */}
        <AccountSection />
        <View className="h-[1px] bg-border my-1" />
        {/* Appearance */}
        <AppearanceSection />
        <View className="h-[1px] bg-border my-1" />

        <Link href={"/categories"} asChild>
          <SettingsItem title="Categories" icon />
        </Link>
        <View className="h-[1px] bg-border my-1" />
        <Link href={"/stores"} asChild>
          <SettingsItem title="Stores" icon />
        </Link>
        <View className="h-[1px] bg-border my-1" />
        {__DEV__ && (
          <Fragment>
            <View className="h-[1px] bg-border my-1" />
            <Link href={"/playground"} asChild>
              <SettingsItem title="Play Ground" icon />
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
    </SafeAreaView>
  );
});

export default Settings;
