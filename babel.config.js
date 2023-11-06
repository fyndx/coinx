module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "@legendapp/state/babel",
      "expo-router/babel",
      [
        "@tamagui/babel-plugin",
        {
          components: ["tamagui"],
          config: "./tamagui.config.ts",
          importsWhitelist: ["constants.js", "colors.js"],
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === "development",
        },
      ],
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      "react-native-reanimated/plugin",
    ],
  };
};
