import type { PropsWithChildren } from "react";

import React from "react";
import { Pressable, View } from "react-native";

interface Action {
  content: React.ReactNode;
  onPress: () => void;
  style?: object;
}

interface SwipeableRowProps {
  rightActions?: Action[];
  leftActions?: Action[];
}

export class SwipeableRow extends React.Component<
  PropsWithChildren<SwipeableRowProps>
> {
  render() {
    const { children, leftActions = [], rightActions = [] } = this.props;
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {leftActions.length > 0 && (
          <View style={{ flexDirection: "row" }}>
            {leftActions.map((action, i) => (
              <Pressable
                // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                key={i}
                onPress={action.onPress}
                style={[
                  {
                    justifyContent: "center",
                    alignItems: "center",
                    width: 48,
                    padding: 8,
                  },
                  action.style,
                ]}
              >
                {action.content}
              </Pressable>
            ))}
          </View>
        )}
        <View style={{ flex: 1 }}>{children}</View>
        {rightActions.length > 0 && (
          <View style={{ flexDirection: "row" }}>
            {rightActions.map((action, i) => (
              <Pressable
                // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                key={i}
                onPress={action.onPress}
                style={[
                  {
                    justifyContent: "center",
                    alignItems: "center",
                    width: 48,
                    padding: 8,
                  },
                  action.style,
                ]}
              >
                {action.content}
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  }
}
