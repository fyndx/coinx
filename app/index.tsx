import { appModel } from "@/src/LegendState/AppState/App.model";
import { observer } from "@legendapp/state/react";
import { Redirect } from "expo-router";
import React from "react";

const AppRoot = observer(() => {
	if (appModel.obs.currency.get() === undefined) {
		return <Redirect href={"/currency-select"} />;
	}
	return <Redirect href={"/(tabs)/transactions"} />;
});

export default AppRoot;
