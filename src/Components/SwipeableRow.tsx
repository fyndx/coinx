import { Trash2 } from "@tamagui/lucide-icons";
import { Component, type PropsWithChildren } from "react";
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
							[-40, 0],
							[1, 0],
							Extrapolation.CLAMP,
						),
					},
				],
			};
		});

		return (
			<RectButton
				style={{ backgroundColor: "red", justifyContent: "center" }}
				onPress={this.close}
			>
				<Reanimated.View style={styleAnimation}>
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
