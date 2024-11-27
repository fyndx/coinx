import React from "react";
import { Redirect, Slot } from "expo-router";
import { observer } from "@legendapp/state/react";
import { appModel } from "@/src/LegendState/AppState/App.model";

const AppRoot = observer(() => {
	if (appModel.obs.currency.get() === undefined) {
		return <Redirect href={"/currency-select"} />;
	}
	return <Redirect href={"/(tabs)/transactions"} />;
});

export default AppRoot;
