import { Trash2 } from "@tamagui/lucide-icons";
import { Component, type PropsWithChildren } from "react";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable, {
	type SwipeableRef,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	type SharedValue,
} from "react-native-reanimated";

interface Action {
	content: React.ReactNode;
	onPress: () => void;
	style?: StyleProp<ViewStyle>;
}

interface SwipeableRowProps {
	rightActions?: Action[];
	leftActions?: Action[];
}

const SWIPE_THRESHOLD = 40;

export class SwipeableRow extends Component<
	PropsWithChildren<SwipeableRowProps>
> {
	private swipeableRowRef?: SwipeableRef | null = null;

	private updateRef = (ref: SwipeableRef | null) => {
		this.swipeableRowRef = ref;
	};

	private renderActions = (
		actions: Action[],
		progress: SharedValue<number>,
		dragX: SharedValue<number>,
		isLeft: boolean,
	) => {
		return actions.map((action, index) => {
			const inputRange = isLeft ? [0, SWIPE_THRESHOLD] : [-SWIPE_THRESHOLD, 0];
			const outputRange = isLeft ? [0, 1] : [1, 0];

			const styleAnimation = useAnimatedStyle(() => {
				return {
					transform: [
						{
							scale: interpolate(
								dragX.value,
								inputRange,
								outputRange,
								Extrapolation.CLAMP,
							),
						},
					],
					opacity: interpolate(
						dragX.value,
						inputRange,
						outputRange,
						Extrapolation.CLAMP,
					),
				};
			});

			return (
				<RectButton
					key={index}
					style={[styles.actionButton, action.style]}
					onPress={() => {
						this.swipeableRowRef?.close();
						action.onPress();
					}}
				>
					<Reanimated.View style={styleAnimation}>
						{action.content}
					</Reanimated.View>
				</RectButton>
			);
		});
	};

	render() {
		const { children, leftActions = [], rightActions = [] } = this.props;
		return (
			<Swipeable
				ref={this.updateRef}
				renderLeftActions={(progress, dragX) =>
					this.renderActions(leftActions, progress, dragX, true)
				}
				renderRightActions={(progress, dragX) =>
					this.renderActions(rightActions, progress, dragX, false)
				}
				leftThreshold={40}
				rightThreshold={40}
			>
				{children}
			</Swipeable>
		);
	}
}

const styles = StyleSheet.create({
	actionButton: {
		justifyContent: "center",
		alignItems: "center",
		width: 48,
	},
	deleteButton: {
		backgroundColor: "red",
		justifyContent: "center",
		minWidth: SWIPE_THRESHOLD,
		padding: 8,
	},
});
