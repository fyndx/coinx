import type { ObservableObject } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { ListItem, Square, Text, XStack, YGroup } from "tamagui";
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
		return (
			<YGroup.Item>
				<SwipeableRow
					key={category.id.peek()}
					onDelete={() => onCategoryDelete(category.peek())}
				>
					<ListItem
						onPress={() => onCategoryPressed(category.peek())}
						alignItems="center"
					>
						<XStack gap={"$4"}>
							<Text fontSize={"$6"}>{category.icon}</Text>
							<Text fontSize={"$6"}>{category.name}</Text>
						</XStack>
						<Square size={"$1"} backgroundColor={category.color.get()} />
					</ListItem>
				</SwipeableRow>
			</YGroup.Item>
		);
	},
);
