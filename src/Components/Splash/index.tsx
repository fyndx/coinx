import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import { Image, YStack } from "tamagui";

export const Splash = () => {
	const scale = useSharedValue(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		scale.value = withRepeat(withTiming(1.5, { duration: 1000 }), -1, true);
	}, []);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<YStack
			flex={1}
			justifyContent={"center"}
			alignItems={"center"}
			backgroundColor={"#def5f0"}
		>
			<Animated.View style={animatedStyle}>
				<Image
					source={{
						uri: require("@/assets/icon.png"),
						width: 250,
						height: 250,
					}}
				/>
			</Animated.View>
		</YStack>
	);
};
