import { Button } from "@/src/Components/ui/Button";
import { Input } from "@/src/Components/ui/Input";
import { Text } from "@/src/Components/ui/Text";
import { authModel } from "@/src/LegendState/Auth/Auth.model";
import { observer } from "@legendapp/state/react";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	View,
} from "react-native";

const SignUp = observer(() => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const isLoading = authModel.obs.isLoading.get();
	const error = authModel.obs.error.get();

	const handleSignUp = async () => {
		if (!email.trim() || !password.trim()) return;

		if (password !== confirmPassword) {
			authModel.obs.error.set("Passwords don't match");
			return;
		}

		if (password.length < 6) {
			authModel.obs.error.set("Password must be at least 6 characters");
			return;
		}

		const result = await authModel.actions.signUp(email.trim(), password);
		if (result.success) {
			if (result.needsConfirmation) {
				Alert.alert(
					"Check your email",
					"We sent you a confirmation link. Please verify your email to sign in.",
					[{ text: "OK", onPress: () => router.replace("/(auth)/sign-in") }],
				);
			} else {
				router.replace("/(tabs)");
			}
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			className="flex-1 bg-background"
		>
			<View className="flex-1 justify-center px-6">
				<View className="mb-8">
					<Text className="text-3xl font-bold text-center">CoinX</Text>
					<Text className="text-muted-foreground text-center mt-2">
						Create an account to sync across devices
					</Text>
				</View>

				{error && (
					<View className="bg-destructive/10 rounded-md p-3 mb-4">
						<Text className="text-destructive text-sm text-center">
							{error}
						</Text>
					</View>
				)}

				<View className="gap-4">
					<View className="gap-1.5">
						<Text className="text-sm font-medium">Email</Text>
						<Input
							placeholder="you@example.com"
							value={email}
							onChangeText={setEmail}
							autoCapitalize="none"
							keyboardType="email-address"
							autoComplete="email"
							editable={!isLoading}
						/>
					</View>

					<View className="gap-1.5">
						<Text className="text-sm font-medium">Password</Text>
						<Input
							placeholder="••••••••"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							autoComplete="new-password"
							editable={!isLoading}
						/>
					</View>

					<View className="gap-1.5">
						<Text className="text-sm font-medium">Confirm Password</Text>
						<Input
							placeholder="••••••••"
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							secureTextEntry
							autoComplete="new-password"
							editable={!isLoading}
						/>
					</View>

					<Button
						onPress={handleSignUp}
						disabled={
							isLoading ||
							!email.trim() ||
							!password.trim() ||
							!confirmPassword.trim()
						}
						loading={isLoading}
						className="mt-2"
					>
						Sign Up
					</Button>
				</View>

				<View className="flex-row justify-center mt-6">
					<Text className="text-muted-foreground">
						Already have an account?{" "}
					</Text>
					<Link href="/(auth)/sign-in" asChild>
						<Pressable>
							<Text className="text-primary font-medium">Sign In</Text>
						</Pressable>
					</Link>
				</View>

				<Pressable
					onPress={() => router.replace("/(tabs)")}
					className="mt-4"
				>
					<Text className="text-muted-foreground text-center text-sm">
						Skip for now
					</Text>
				</Pressable>
			</View>
		</KeyboardAvoidingView>
	);
});

export default SignUp;
