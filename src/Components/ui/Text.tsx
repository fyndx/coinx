import * as React from "react";
import { Text as BaseText, type TextProps } from "react-native";

import { cn } from "@/src/utils/cn";

const Text = React.forwardRef<BaseText, TextProps>(
  ({ className, ...props }, ref) => {
    return (
      <BaseText
        ref={ref}
        className={cn(
          "text-base text-foreground dark:text-white file:font-medium",
          className,
        )}
        {...props}
      />
    );
  },
);
Text.displayName = "Text";

export { Text };
