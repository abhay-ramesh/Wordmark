"use client";
import {
  LucideIcon,
  LucideIconList,
  LucideIconStatic,
} from "@/components/icons";
import { LucideIconType } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "../ui/input";

export function IconSelector({
  value,
  onChange,
  className,
}: {
  value: string | null | undefined;
  onChange: (value: string) => void;
  className?: string;
}) {
  const INCREMENT = 100;
  const [open, setOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<LucideIconType | undefined>(
    value as LucideIconType,
  );
  const [iconsToShow, setIconsToShow] = useState(INCREMENT);
  const [searchTerm, setSearchTerm] = useState("");

  const showMoreIcons = () => {
    setIconsToShow(iconsToShow + INCREMENT);
  };

  const filteredIcons = useMemo(() => {
    return LucideIconList.filter((icon) =>
      icon.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  const clearSelectedIcon = () => {
    setSelectedIcon(undefined);
    onChange(""); // Notify the parent component of the change
  };

  return (
    <div className="h-full w-full gap-4">
      <div className="relative flex items-center justify-between">
        <Input
          type="text"
          placeholder="Search icons..."
          className=""
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          aria-label="Search icons"
        />
        {searchTerm && (
          <X
            className="absolute right-2 z-20 cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            onClick={clearSearch}
          />
        )}
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        <TooltipProvider>
          {filteredIcons.length === 0 ? (
            <div className="col-span-4 mt-4 w-full text-center text-gray-400">
              No icons found
            </div>
          ) : (
            filteredIcons.slice(0, iconsToShow).map((icon) => (
              <Tooltip key={icon}>
                <TooltipTrigger asChild>
                  <Button
                    className={cn(
                      "mx-auto items-center justify-center rounded-full py-3 text-base font-medium",
                      {
                        "bg-blue-600 text-white hover:bg-blue-600/90":
                          icon === selectedIcon,
                        "border bg-white text-primary hover:bg-gray-200":
                          icon !== selectedIcon,
                      },
                    )}
                    variant={"ghostV2"}
                    size="icon"
                    onClick={() => {
                      if (icon === selectedIcon) {
                        clearSelectedIcon();
                      } else {
                        setSelectedIcon(icon as LucideIconType);
                        onChange(icon); // Notify the parent component of the change
                      }
                      setOpen(false);
                    }}
                  >
                    <LucideIconStatic name={icon as LucideIconType} size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{icon}</TooltipContent>
              </Tooltip>
            ))
          )}
        </TooltipProvider>
      </div>
      {iconsToShow < filteredIcons.length && (
        <Button
          className="mt-4 w-full cursor-pointer rounded-md bg-blue-500 p-2 text-center text-white"
          onClick={showMoreIcons}
        >
          Load More
        </Button>
      )}
    </div>
  );
}
