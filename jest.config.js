module.exports = {
	preset: "react-native",
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	setupFilesAfterEnv: [
		"./node_modules/@testing-library/jest-native/extend-expect",
	],
};
