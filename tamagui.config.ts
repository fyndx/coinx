// the v2 config imports the css driver on web and react-native on native
// for reanimated: @tamagui/config/v2-reanimated
// for react-native only: @tamagui/config/v2-native
import { config } from "@tamagui/config/v2-reanimated";
import { createTamagui } from "tamagui";
import { themes } from "./themes";
// import { createAnimations} from "@tamagui/animations-moti"

const tamaguiConfig = createTamagui({
	...config,
	themes: themes,
	// animations: createAnimations({})
});

// this makes typescript properly type everything based on the config
type Conf = typeof tamaguiConfig;
declare module "tamagui" {
	interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig;

// depending on if you chose tamagui, @tamagui/core, or @tamagui/web
// be sure the import and declare module lines both use that same name
