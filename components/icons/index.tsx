import dynamic from "next/dynamic";
import { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { LucideIconStatic } from "./LucideIconStatic";

type LucideIconType = keyof typeof dynamicIconImports;

// get all icon names
export const LucideIconList = Object.keys(dynamicIconImports);

export interface IconProps extends LucideProps {
  name: keyof typeof dynamicIconImports;
}

const LucideIcon = ({ name, ...props }: IconProps) => {
  const LuciIcon = dynamic(dynamicIconImports[name]);

  if (!LuciIcon) {
    return null;
  }

  return <LuciIcon {...props} />;
};

export { LucideIcon, LucideIconStatic };
export type { LucideIconType };
