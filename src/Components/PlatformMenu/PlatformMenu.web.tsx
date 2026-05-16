import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";

import type { PlatformMenuProps } from "./types";

export function PlatformMenu({
  actions,
  onPressAction,
  children,
}: PlatformMenuProps) {
  const handleAction = (key: React.Key) => {
    onPressAction({ nativeEvent: { event: String(key) } });
  };

  return (
    <Dropdown>
      <DropdownTrigger>{children}</DropdownTrigger>
      <DropdownMenu
        aria-label="Actions"
        onAction={handleAction}
      >
        {actions.map((action) => (
          <DropdownItem key={action.id}>{action.title}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
