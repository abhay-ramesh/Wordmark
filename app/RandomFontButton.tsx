"use client";
import { Button } from "@/components/ui/button";
import { getAllFontList } from "@/lib/fontProviders";
import { fontAtom } from "@/lib/statemanager";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { Loader2, Shuffle } from "lucide-react";
import { useCallback, useState } from "react";

export function RandomFontButton() {
  const [selectedFont, setSelectedFont] = useAtom(fontAtom);
  const [randomizing, setRandomizing] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Get all fonts from all providers for random selection
  const getAllProviderFonts = useCallback(() => {
    // Get all available fonts for randomization
    return getAllFontList();
  }, []);

  // Select a random font
  const selectRandomFont = useCallback(() => {
    // Get all provider fonts to have the complete list
    const allProviderFonts = getAllProviderFonts();

    if (allProviderFonts.length > 0) {
      // Show randomizing animation
      setRandomizing(true);

      // Small timeout to allow animation to show
      setTimeout(() => {
        // Select a random font from the list
        const randomIndex = Math.floor(Math.random() * allProviderFonts.length);
        const randomFont = allProviderFonts[randomIndex];

        // Set it as selected font
        setSelectedFont(randomFont);
        setRandomizing(false);
      }, 300);
    }
  }, [getAllProviderFonts, setSelectedFont]);

  return (
    <Button
      variant="default"
      size="default"
      className={cn(
        "relative flex items-center gap-1.5 overflow-hidden bg-gradient-to-r from-primary/80 to-primary px-4 shadow-md transition-all duration-300",
        hovered ? "shadow-lg" : "",
      )}
      onClick={selectRandomFont}
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
