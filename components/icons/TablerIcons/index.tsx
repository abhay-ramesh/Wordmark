import type { TablerIconsProps } from "@tabler/icons-react";
import * as TablerIcons from "@tabler/icons-react";

// Exclude the unwanted icon (createReactComponent) from the list
const filteredIconNames = Object.keys(TablerIcons).filter(
  (iconName) => iconName !== "createReactComponent",
);

// exclude the first one, which is the default export
export type TablerIconType = (typeof filteredIconNames)[number];

// get all icon names
export const TablerIconList = Object.keys(TablerIcons).slice(1); // slice(1) to exclude the first one, which is the default export

export interface TablerIconProps extends TablerIconsProps {
  name: TablerIconType;
}

export const TablerIcon = ({ name, ...props }: TablerIconProps) => {
  // @ts-ignore
  const Icon = TablerIcons[name];

  if (!Icon) {
    return null;
  }

  return <Icon {...props} />;
};
