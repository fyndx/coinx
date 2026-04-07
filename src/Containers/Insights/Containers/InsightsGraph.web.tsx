import { observer } from "@legendapp/state/react";
import { View } from "react-native";

import type { InsightsModel } from "@/src/LegendState/Insights/Insights.model";

import { BarGraphView } from "../Components/BarGraphView";
import { InsightsView } from "../Components/InsightsView";
import { LineGraphView } from "../Components/LineGraphView";

export const InsightsGraph = observer(
  ({ insightsModel$ }: { insightsModel$: InsightsModel }) => {
    return (
      <View>
        <InsightsView insightsModel$={insightsModel$} />
        <BarGraphView insightsModel$={insightsModel$} />
        <LineGraphView insightsModel$={insightsModel$} />
      </View>
    );
  },
);
