import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
	cancelAnimation,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";

const SplashIcon = require("@/assets/icon.png");

export const Splash = () => {
	const scale = useSharedValue(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		scale.value = withRepeat(withTiming(1.5, { duration: 1000 }), -1, true);

		return () => {
			scale.value = 0;
			cancelAnimation(scale);
		};
	}, []);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<View style={styles.container}>
			<Animated.View style={animatedStyle}>
				<Image source={SplashIcon} style={{ width: 250, height: 250 }} />
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#def5f0",
	},
});
