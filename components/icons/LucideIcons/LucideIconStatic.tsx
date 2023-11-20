import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";
import { IconProps } from ".";

export const LucideIconStatic = ({ name, ...props }: IconProps) => {
  // Convert to CapitalCase with no dashes with all first letters capitalized and allow numbers too.
  const newName = name
    .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    .replace(/^[a-z]/g, (g) => g.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");

  // @ts-ignore
  const IconComponent = LucideIcons[newName] as React.FC<LucideProps>;

  if (!IconComponent) {
    return null;
  }

  return <IconComponent {...props} />;
};
