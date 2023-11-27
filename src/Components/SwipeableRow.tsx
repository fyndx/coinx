import { Trash2 } from "@tamagui/lucide-icons";
import { PropsWithChildren, Component } from "react";
import { Animated } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";

interface SwipeableRowProps {
  onDelete?: () => void;
}

export class SwipeableRow extends Component<
  PropsWithChildren<SwipeableRowProps>
> {
  private swipeableRowRef?: Swipeable;

  private updateRef = (ref: Swipeable) => {
    this.swipeableRowRef = ref;
  };

  private close = () => {
    this.swipeableRowRef?.close();
    this.props.onDelete?.();
  };

  private renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-40, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <RectButton
        style={{ backgroundColor: "red", justifyContent: "center" }}
        onPress={this.close}
      >
        <Animated.View
          style={{
            marginHorizontal: 10,
            transform: [{ scale: scale }],
          }}
        >
          <Trash2 size={"$3"} />
        </Animated.View>
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
      >
        {children}
      </Swipeable>
    );
  }
}
