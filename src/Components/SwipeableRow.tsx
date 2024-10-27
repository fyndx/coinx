import { Trash2 } from "@tamagui/lucide-icons";
import { Component, type PropsWithChildren } from "react";
import { StyleSheet } from "react-native";
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

interface SwipeableRowProps {
	onDelete?: () => void;
}

const SWIPE_THRESHOLD = 40;
const SCALE_RANGE = {
	INPUT: [-SWIPE_THRESHOLD, 0],
	OUTPUT: [1, 0],
};

export class SwipeableRow extends Component<
	PropsWithChildren<SwipeableRowProps>
> {
	private swipeableRowRef?: SwipeableRef;

	private updateRef = (ref: SwipeableRef) => {
		this.swipeableRowRef = ref;
	};

	private close = () => {
		this.swipeableRowRef?.close();
		this.props.onDelete?.();
	};

	private renderRightActions = (
		_progress: SharedValue<number>,
		dragX: SharedValue<number>,
	) => {
		const styleAnimation = useAnimatedStyle(() => {
			return {
				transform: [
					{
						scale: interpolate(
							dragX.value,
							SCALE_RANGE.INPUT,
							SCALE_RANGE.OUTPUT,
							Extrapolation.CLAMP,
						),
					},
				],
				opacity: interpolate(
					dragX.value,
					SCALE_RANGE.INPUT,
					[1, 0.7],
					Extrapolation.CLAMP,
				),
			};
		});

		return (
			<RectButton style={styles.deleteButton} onPress={this.close}>
				<Reanimated.View
					accessibilityLabel="Delete item"
					accessibilityRole="button"
					accessibilityHint="Double tap to delete this item"
					style={styleAnimation}
				>
					<Trash2 size={"$3"} />
				</Reanimated.View>
			</RectButton>
		);
	};

	render() {
		const { children } = this.props;
		return (
			<Swipeable
				ref={this.updateRef}
				renderRightActions={this.renderRightActions}
				rightThreshold={40}
				friction={2}
			>
				{children}
			</Swipeable>
		);
	}
}

const styles = StyleSheet.create({
	deleteButton: {
		backgroundColor: "red",
		justifyContent: "center",
		minWidth: SWIPE_THRESHOLD,
		padding: 8,
	},
});
