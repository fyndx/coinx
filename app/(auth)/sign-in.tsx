import { Button } from "@/src/Components/ui/Button";
import { Input } from "@/src/Components/ui/Input";
import { Text } from "@/src/Components/ui/Text";
import { authModel } from "@/src/LegendState/Auth/Auth.model";
import { observer } from "@legendapp/state/react";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	View,
} from "react-native";

const SignIn = observer(() => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const isLoading = authModel.obs.isLoading.get();
	const error = authModel.obs.error.get();

	const handleSignIn = async () => {
		if (!email.trim() || !password.trim()) return;

		const result = await authModel.actions.signIn(email.trim(), password);
		if (result.success) {
			router.replace("/");
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
						Sign in to sync your data
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
							autoComplete="password"
							editable={!isLoading}
						/>
					</View>

					<Button
						onPress={handleSignIn}
						disabled={isLoading || !email.trim() || !password.trim()}
						loading={isLoading}
						className="mt-2"
					>
						Sign In
					</Button>
				</View>

				<View className="flex-row justify-center mt-6">
					<Text className="text-muted-foreground">
						Don't have an account?{" "}
					</Text>
					<Link href="/(auth)/sign-up" asChild>
						<Pressable>
							<Text className="text-primary font-medium">Sign Up</Text>
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

export default SignIn;
