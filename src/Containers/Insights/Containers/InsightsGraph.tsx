import type { InsightsModel } from "@/src/LegendState/Insights/Insights.model";
import { observer } from "@legendapp/state/react";
import { Component } from "react";
import type { Animated as RNAnimated } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Animated from "react-native-reanimated";
import { BarGraphView } from "../Components/BarGraphView";
import { InsightsView } from "../Components/InsightsView";
import { LineGraphView } from "../Components/LineGraphView";

interface InsightsGraphProps {
	swipeData: ReturnType<InsightsModel["swipeData"]["get"]>;
	onSwipe: (direction: "left" | "right") => void;
	children?: React.ReactNode;
}

export class SwipeableGraph extends Component<InsightsGraphProps> {
	renderLeftActions = (
		progress: RNAnimated.AnimatedInterpolation<number>,
		_dragAnimatedValue: RNAnimated.AnimatedInterpolation<number>,
	) => {
		return (
			<RectButton>
				<Animated.Text>{this.props.swipeData.prevStartDate}</Animated.Text>
			</RectButton>
		);
	};

	renderRightActions = (
		progress: RNAnimated.AnimatedInterpolation<number>,
		_dragAnimatedValue: RNAnimated.AnimatedInterpolation<number>,
	) => {
		return (
			<RectButton>
				<Animated.Text>{this.props.swipeData.nextStartDate}</Animated.Text>
			</RectButton>
		);
	};

	private swipeableRow?: Swipeable;

	private updateRef = (ref: Swipeable) => {
		this.swipeableRow = ref;
	};

	private close = () => {
		this.swipeableRow?.close();
	};

	render() {
		return (
			<Swipeable
				ref={this.updateRef}
				renderLeftActions={this.renderLeftActions}
				renderRightActions={this.renderRightActions}
				onSwipeableOpen={(direction) => {
					this.props.onSwipe(direction);
					this.close();
				}}
			>
				{this.props.children}
			</Swipeable>
		);
	}
}

export const InsightsGraph = observer(
	({ insightsModel$ }: { insightsModel$: InsightsModel }) => {
		const swipeData = insightsModel$.swipeData.get(true);
		return (
			<>
				<SwipeableGraph
					swipeData={swipeData}
					onSwipe={insightsModel$.actions.onSwipe}
				>
					<InsightsView insightsModel$={insightsModel$} />
					<BarGraphView insightsModel$={insightsModel$} />
				</SwipeableGraph>

				<LineGraphView insightsModel$={insightsModel$} />
			</>
		);
	},
);
