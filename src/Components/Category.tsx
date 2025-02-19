import type { ObservableObject } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { Trash2 } from "@tamagui/lucide-icons";
import { RectButton } from "react-native-gesture-handler";
import { ListItem, Square, Text, XStack, YGroup, YStack } from "tamagui";
import { rootStore } from "../LegendState";
import type { ICategory } from "../LegendState/Category.model";
import { SwipeableRow } from "./SwipeableRow";

interface CategoryProps {
	category: ObservableObject<ICategory>;
	onCategoryPressed: (category: ICategory) => void;
	onCategoryDelete: (category: ICategory) => void;
}

export const Category = observer(
	({ category, onCategoryPressed, onCategoryDelete }: CategoryProps) => {
		const categoryData = category.peek();
		return (
			<YGroup.Item key={categoryData.id}>
				<SwipeableRow
					key={categoryData.id}
					rightActions={[
						{
							content: <Trash2 color={"$white5"} />,
							style: { backgroundColor: "red" },
							onPress: () => {
								onCategoryDelete(categoryData);
							},
						},
					]}
				>
					<RectButton onPress={() => onCategoryPressed(categoryData)}>
						<ListItem alignItems="center">
							<XStack gap={"$4"}>
								<Text fontSize={"$6"}>{category.icon}</Text>
								<Text fontSize={"$6"}>{category.name}</Text>
							</XStack>
							<Square size={"$1"} backgroundColor={categoryData.color} />
						</ListItem>
					</RectButton>
				</SwipeableRow>
			</YGroup.Item>
		);
	},
);
