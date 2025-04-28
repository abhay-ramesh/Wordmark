"use client";

import { cn } from "@/lib/utils";
import {
  currentVersionIndexAtom,
  DesignVersion,
  restoreVersionAtom,
  versionHistoryAtom,
} from "@/lib/versionHistory";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { LayoutVariants } from "../custom/SelectableLayoutCard";
import { Button } from "../ui/button";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export function VersionHistory() {
  const [history] = useAtom(versionHistoryAtom);
  const [currentIndex, setCurrentIndex] = useAtom(currentVersionIndexAtom);
  const [, restoreVersion] = useAtom(restoreVersionAtom);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // If no history, don't render anything
  if (history.length === 0) {
    return null;
  }

  const handleVersionClick = (index: number) => {
    restoreVersion(index);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), "HH:mm:ss");
  };

  return (
    <div className="mt-4 w-full max-w-full">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Version History</h3>
        <span className="text-xs text-muted-foreground">
          {history.length} versions
        </span>
      </div>

      <div className="relative w-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 z-10 h-8 w-8 -translate-y-1/2 transform bg-background/80"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <ScrollArea className="w-full pb-2">
          <div className="flex space-x-3 px-6 py-1" ref={scrollContainerRef}>
            {history.map((version, index) => (
              <VersionCard
                key={version.id}
                version={version}
                isActive={index === currentIndex}
                onClick={() => handleVersionClick(index)}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <Button
          variant="ghost"
          size="icon"
          onClick={scrollRight}
          className="absolute right-0 top-1/2 z-10 h-8 w-8 -translate-y-1/2 transform bg-background/80"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Mini version card component
function VersionCard({
  version,
  isActive,
  onClick,
}: {
  version: DesignVersion;
  isActive: boolean;
  onClick: () => void;
}) {
  // Calculate scaled dimensions for mini card
  const scaleFactor = 0.15; // 15% of original size
  const width = Math.max(version.card.width.value * scaleFactor, 60); // Min width 60px
  const height = Math.max(version.card.height.value * scaleFactor, 34); // Min height 34px

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        className={cn(
          "group relative flex flex-col transition-all",
          isActive
            ? "scale-105 ring-2 ring-primary"
            : "hover:ring-1 hover:ring-primary/50",
        )}
      >
        {/* Mini display card */}
        <div
          className={cn(
            LayoutVariants({ layout: version.layout }),
            "overflow-hidden rounded-md shadow-md",
            isActive ? "opacity-100" : "opacity-90 group-hover:opacity-100",
          )}
          style={{
            backgroundColor: version.card.color.hex,
            width: `${width}px`,
            height: `${height}px`,
            transform: "scale(1)",
            transition: "all 0.2s ease",
          }}
        >
          {/* Text preview (simplified) */}
          {version.text && (
            <div
              className="flex h-full w-full items-center justify-center overflow-hidden text-center"
              style={{
                color: version.text.color.hex,
                fontSize: `${Math.max(version.text.size * scaleFactor, 8)}px`, // Min font size
              }}
            >
              {version.text.text.length > 10
                ? version.text.text.substring(0, 10) + "..."
                : version.text.text}
            </div>
          )}
        </div>

        {/* Version label */}
        <div
          className={cn(
            "absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border bg-background text-[10px] font-semibold",
            isActive ? "border-primary" : "border-muted-foreground/30",
          )}
        >
          {version.id}
        </div>
      </button>

      {/* Timestamp */}
      <div className="mt-1 text-[10px] text-muted-foreground">
        {format(new Date(version.timestamp), "HH:mm:ss")}
      </div>
    </div>
  );
}
