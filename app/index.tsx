import React from "react";
import { Redirect } from "expo-router";

const AppRoot = () => {
  return <Redirect href={"/(tabs)/transactions"} />;
};

export default AppRoot;
