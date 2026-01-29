import type { ObservableObject } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { Trash2 } from "lucide-react-native";
import { View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import type { ICategory } from "../LegendState/Category.model";
import { Text } from "./ui/Text";
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
			<View key={categoryData.id} className="border-b border-border">
				<SwipeableRow
					key={categoryData.id}
					rightActions={[
						{
							content: <Trash2 color="white" />,
							style: { backgroundColor: "red" },
							onPress: () => {
								onCategoryDelete(categoryData);
							},
						},
					]}
				>
					<RectButton onPress={() => onCategoryPressed(categoryData)}>
						<View className="flex-row items-center justify-between p-4 bg-background">
							<View className="flex-row items-center gap-4">
								<Text className="text-xl">{category.icon.get()}</Text>
								<Text className="text-xl">{category.name.get()}</Text>
							</View>
							<View
								style={{
									width: 20,
									height: 20,
									backgroundColor: categoryData.color,
								}}
							/>
						</View>
					</RectButton>
				</SwipeableRow>
			</View>
		);
	},
);

