import { observer } from "@legendapp/state/react";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, View } from "react-native";

import { Button } from "@/src/Components/ui/Button";
import { Text } from "@/src/Components/ui/Text";
import { authModel } from "@/src/LegendState/Auth/Auth.model";
import { setupModel } from "@/src/LegendState/Setup/Setup.model";

const STEP_LABELS: Record<string, string> = {
  idle: "Preparing your account",
  "connecting-account": "Connecting your account",
  "syncing-data": "Syncing your data",
  "checking-data": "Checking existing data",
  "creating-defaults": "Creating defaults",
  finishing: "Finishing setup",
};

const SetupScreen = observer(() => {
  const isAuthenticated = authModel.obs.isAuthenticated.get();
  const setupStatus = setupModel.obs.status.get();
  const setupStep = setupModel.obs.step.get();
  const setupError = setupModel.obs.error.get();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/sign-in");
      return;
    }

    if (setupStatus === "needsSetup") {
      setupModel.actions.run().then((result) => {
        if (result.success) {
          router.replace("/(tabs)" as const as "/");
        }
      });
      return;
    }

    if (setupStatus === "success") {
      router.replace("/(tabs)/transactions");
    }
  }, [isAuthenticated, setupStatus]);

  const retrySetup = async () => {
    setupModel.actions.clearError();
    const result = await setupModel.actions.run();
    if (result.success) {
      router.replace("/(tabs)/transactions");
    }
  };

  const isRunning = setupStatus === "running" || setupStatus === "needsSetup";
  const currentStep = STEP_LABELS[setupStep] ?? STEP_LABELS.idle;

  return (
    <View className="flex-1 bg-background px-6 justify-center">
      <View className="bg-card rounded-2xl p-6 gap-4">
        <View className="gap-2">
          <Text className="text-2xl font-bold text-center">
            Setting things up
          </Text>
          <Text className="text-center text-muted-foreground">
            {isRunning
              ? "We are getting your account ready before you enter the app."
              : "Setup could not finish. Retry to continue into the app."}
          </Text>
        </View>

        <View className="bg-muted rounded-xl p-4">
          <Text className="text-sm text-muted-foreground text-center">
            Current step
          </Text>
          <Text className="text-base font-medium text-center mt-1">
            {currentStep}
          </Text>
        </View>

        {setupError && (
          <View className="bg-destructive/10 rounded-xl p-4">
            <Text className="text-destructive text-center text-sm">
              {setupError}
            </Text>
          </View>
        )}

        {isRunning ? (
          <Text className="text-center text-sm text-muted-foreground">
            Please keep the app open while setup completes.
          </Text>
        ) : (
          <View className="gap-3">
            <Button onPress={retrySetup}>Retry Setup</Button>
            <Button
              variant="outline"
              onPress={() => authModel.actions.signOut()}
            >
              Sign Out
            </Button>
          </View>
        )}
      </View>

      {!isRunning && (
        <Pressable
          onPress={() => authModel.actions.signOut()}
          className="mt-4"
        >
          <Text className="text-center text-muted-foreground text-sm">
            Use another account
          </Text>
        </Pressable>
      )}
    </View>
  );
});

export default SetupScreen;
