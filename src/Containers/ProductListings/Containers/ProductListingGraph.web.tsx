import { observer } from "@legendapp/state/react";
import { View } from "react-native";

import type { ProductsListingHistoryModel } from "@/src/LegendState/ProductListingHistory/ProductListingHistory.model";

import { Text } from "@/src/Components/ui/Text";

interface ProductListingGraphProps {
  productListingHistoryModel$: ProductsListingHistoryModel;
}

export const ProductListingGraph = observer(
  (props: ProductListingGraphProps) => {
    const { graphData, productListingNames, colors } =
      props.productListingHistoryModel$.productsListingHistory;
    const extractedGraphData = graphData.get();
    const extractedProducts = productListingNames.get();
    const extractedColors = colors.get();

    if (!extractedGraphData || extractedGraphData.length === 0) {
      return (
        <View className="items-center justify-center p-4">
          <Text>No data available</Text>
        </View>
      );
    }

    return (
      <View style={{ height: 300, padding: 12 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {extractedProducts.map((key) => (
            <View key={key} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: extractedColors[key] ?? "#7c3aed",
                }}
              />
              <Text style={{ fontSize: 12 }}>{key}</Text>
            </View>
          ))}
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text className="text-muted-foreground text-sm">
            Interactive price chart available on the mobile app
          </Text>
        </View>
      </View>
    );
  },
);
