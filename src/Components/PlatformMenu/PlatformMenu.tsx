import { MenuView } from "@react-native-menu/menu";

import type { PlatformMenuProps } from "./types";

export function PlatformMenu({
  actions,
  onPressAction,
  children,
}: PlatformMenuProps) {
  return (
    <MenuView actions={actions} onPressAction={onPressAction}>
      {children}
    </MenuView>
  );
}
