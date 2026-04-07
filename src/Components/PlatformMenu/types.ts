import type { ReactNode } from "react";

export interface PlatformMenuAction {
  id: string;
  title: string;
}

export interface PlatformMenuEvent {
  nativeEvent: { event: string };
}

export interface PlatformMenuProps {
  actions: PlatformMenuAction[];
  onPressAction: (event: PlatformMenuEvent) => void;
  children: ReactNode;
}
