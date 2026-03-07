module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo"],
    ],
    plugins: [
      ["@legendapp/state/babel"],
      ["inline-import", { extensions: [".sql"] }],
      "react-native-reanimated/plugin",
    ],
  };
};

