import { Tabs } from "expo-router";
import { Image } from "tamagui";

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name={"transactions/index"}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <Image
              source={require("../../assets/icons/transactions-list.png")}
              width={24}
              height={24}
            />
          ),
          header: () => null,
        }}
      />
      <Tabs.Screen
        name={"insights/index"}
        options={{
          header: () => null,
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <Image
              source={require("../../assets/icons/insights.png")}
              width={24}
              height={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name={"add-transaction/index"}
        options={{
          header: () => null,
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <Image
              source={require("../../assets/icons/add.png")}
              width={24}
              height={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name={"budgets/index"}
        options={{
          header: () => null,
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <Image
              source={require("../../assets/icons/budgets.png")}
              width={24}
              height={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name={"settings/index"}
        options={{          
          headerTitle: "Settings",
          headerTitleAlign: "center",
          headerStatusBarHeight: 0,
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <Image
              source={require("../../assets/icons/settings.png")}
              width={24}
              height={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
