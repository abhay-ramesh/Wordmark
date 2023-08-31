"use client";

import { cn } from "@/lib/utils";
import * as icons from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export const IconGrid = ({
  icon,
  setIcon,
}: {
  icon: string;
  setIcon: (icon: string) => void;
}) => {
  const [effect, setEffect] = useState(false);
  // Get all the icon names
  const iconNames = Object.keys(icons);

  const numberOfIcons = 100;
  const [displayedIcons, setDisplayedIcons] = useState<string[]>([]);

  // Get first 20 icon names with skipping one in between
  const firstNIconNames = useCallback(
    (from: number, to: number) =>
      iconNames.filter((_, i) => i % 2 === 0).slice(from, to),
    [iconNames],
  );

  const loadMore = useCallback(() => {
    console.log("loadMore");
    setDisplayedIcons((prev) => [
      ...prev,
      ...firstNIconNames(prev.length, prev.length + numberOfIcons),
    ]);
  }, [firstNIconNames]);

  useEffect(() => {
    console.log("useEffect");
    if (!effect) {
      setEffect(true);
      loadMore();
    }
  }, [effect, loadMore]);

  return (
    <>
      <div className="grid grid-cols-4 gap-2 overflow-x-hidden">
        {displayedIcons.map((iconName) => {
          // @ts-ignore
          const Icon = icons[iconName] as React.FC<{ size: number }>;
          return (
            <div
              key={iconName}
              className={cn(
                "group relative flex aspect-square h-14 w-full flex-col items-center justify-center space-y-2 rounded-md p-3 text-gray-600",
                {
                  "bg-gray-200": icon === iconName,
                },
              )}
              onClick={() => setIcon(iconName)}
            >
              <Icon size={32} />
              <text className="absolute -bottom-4 z-10 hidden whitespace-nowrap rounded border-2 border-black bg-white px-2 py-1 text-xs font-semibold text-gray-600 group-hover:block">
                {iconName.replace(/([A-Z])/g, " $1").trim()}
              </text>
            </div>
          );
        })}
      </div>
      {/* Load More */}
      <div
        className="flex h-fit w-full cursor-pointer items-center justify-center space-x-2 bg-gray-200 py-6 text-gray-600 hover:bg-gray-300"
        onClick={loadMore}
      >
        <text className="text-xs font-semibold ">Load More</text>
        <icons.ArrowDownIcon size={16} />
      </div>
    </>
  );
};
