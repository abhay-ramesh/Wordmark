"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Shuffle } from "lucide-react";
import { useCallback, useState } from "react";

interface RandomFontButtonProps {
  onRandomFont?: () => void;
}

export function RandomFontButton({ onRandomFont }: RandomFontButtonProps) {
  const [randomizing, setRandomizing] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Handle randomization
  const handleRandomize = useCallback(() => {
    if (onRandomFont) {
      setRandomizing(true);

      // Small timeout to allow animation to show
      setTimeout(() => {
        onRandomFont();
        setRandomizing(false);
      }, 300);
    }
  }, [onRandomFont]);

  return (
    <Button
      variant="default"
      size="default"
      className={cn(
        "relative flex items-center gap-1.5 overflow-hidden bg-gradient-to-r from-primary/80 to-primary px-4 shadow-md transition-all duration-300",
        hovered ? "shadow-lg" : "",
      )}
      onClick={handleRandomize}
      disabled={randomizing}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={cn(
          "transition-transform duration-500",
          hovered && !randomizing ? "animate-bounce" : "",
        )}
      >
        {randomizing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Shuffle className="h-3.5 w-3.5" />
        )}
      </div>
      <span className="text-sm font-medium">Random Font</span>
    </Button>
  );
}
