import { Trash2 } from "@tamagui/lucide-icons";
import { Component, type PropsWithChildren } from "react";
import { type StyleProp, StyleSheet, type ViewStyle } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable, {
	type SwipeableMethods,
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

const ActionButton = ({
	action,
	dragX,
	inputRange,
	outputRange,
	swipeable,
}: {
	action: Action;
	dragX: SharedValue<number>;
	inputRange: number[];
	outputRange: number[];
	swipeable: SwipeableMethods;
}) => {
	const styleAnimation = useAnimatedStyle(() => ({
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
	}));
	return (
		<RectButton
			style={[styles.actionButton, action.style]}
			onPress={() => {
				swipeable.close();
				action.onPress();
			}}
		>
			<Reanimated.View style={styleAnimation}>{action.content}</Reanimated.View>
		</RectButton>
	);
};

export class SwipeableRow extends Component<
	PropsWithChildren<SwipeableRowProps>
> {
	private swipeableRowRef?: SwipeableRef | null = null;

	private updateRef = (ref: SwipeableRef | null) => {
		this.swipeableRowRef = ref;
	};

	private renderActions = ({
		actions,
		dragX,
		isLeft,
		swipeable,
	}: {
		actions: Action[];
		progress: SharedValue<number>;
		dragX: SharedValue<number>;
		isLeft: boolean;
		swipeable: SwipeableMethods;
	}) => {
		const inputRange = isLeft ? [0, SWIPE_THRESHOLD] : [-SWIPE_THRESHOLD, 0];
		const outputRange = isLeft ? [0, 1] : [1, 0];

		return actions.map((action, index) => {
			return (
				<ActionButton
					key={`${action.content}-${index}`}
					action={action}
					dragX={dragX}
					inputRange={inputRange}
					outputRange={outputRange}
					swipeable={swipeable}
				/>
			);
		});
	};

	render() {
		const { children, leftActions = [], rightActions = [] } = this.props;
		return (
			<Swipeable
				ref={this.updateRef}
				renderLeftActions={(progress, dragX, swipeable) =>
					this.renderActions({
						actions: leftActions,
						progress,
						dragX,
						isLeft: true,
						swipeable,
					})
				}
				renderRightActions={(progress, dragX, swipeable) =>
					this.renderActions({
						actions: rightActions,
						progress,
						dragX,
						isLeft: false,
						swipeable,
					})
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
