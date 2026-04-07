import { observer } from "@legendapp/state/react";
import { View } from "react-native";

import type { InsightsModel } from "@/src/LegendState/Insights/Insights.model";

import { Text } from "@/src/Components/ui/Text";

export const BarGraphView = observer(
  ({ insightsModel$ }: { insightsModel$: InsightsModel }) => {
    const graphData = insightsModel$.durationGraphData.get();
    const maxTotal = Math.max(...graphData.map((d) => d.total), 1);

    return (
      <View style={{ height: 275, paddingHorizontal: 12, paddingTop: 12 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          {graphData.map((item, index) => {
            const heightPct = (item.total / maxTotal) * 100;
            return (
              <View
                // biome-ignore lint/suspicious/noArrayIndexKey: stable index list
                key={index}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <View
                  style={{
                    width: "80%",
                    height: `${heightPct}%`,
                    backgroundColor: "#7c3aed",
                    borderRadius: 4,
                    minHeight: 4,
                  }}
                />
                <Text style={{ fontSize: 10, marginTop: 2 }}>{item.day}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  },
);
