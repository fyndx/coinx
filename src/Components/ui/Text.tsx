import { cn } from "@/src/utils/cn";
import * as React from "react";
import { Text as RUNativeText, type TextProps } from "react-native";

const Text = React.forwardRef<React.ElementRef<typeof RUNativeText>, TextProps>(
	({ className, ...props }, ref) => {
		return (
			<RUNativeText
				ref={ref}
				className={cn("text-base text-foreground file:font-medium", className)}
				{...props}
			/>
		);
	},
);
Text.displayName = "Text";

export { Text };
