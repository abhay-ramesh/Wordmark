"use client";

import { cn } from "@/lib/utils";
import * as icons from "lucide-react";

export const SelectedIcon = ({
  icon,
  iconSize = 32,
  onlyIcon = false,
  className = "",
  absoluteStrokeWidth,
  style,
}: {
  icon: string;
  iconSize?: number;
  onlyIcon?: boolean;
  className?: string;
  absoluteStrokeWidth?: boolean;
  style?: React.CSSProperties;
}) => {
  if (icon === "") return null;
  // @ts-ignore
  const Icon = icons[icon] as React.FC<icons.LucideProps>;

  if (onlyIcon) {
    return (
      <Icon
        size={iconSize}
        className={className}
        absoluteStrokeWidth={absoluteStrokeWidth}
        style={style}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-20 w-full items-center justify-center space-x-2 rounded-2xl bg-gray-200 p-3 text-gray-600",
        className,
      )}
    >
      <Icon size={iconSize} />

      <text className="w-fit text-center text-sm font-semibold text-gray-600 [text-wrap:balance]">
        {icon.replace(/([A-Z])/g, " $1").trim()}
      </text>
    </div>
  );
};
