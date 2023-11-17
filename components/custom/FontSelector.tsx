"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import GoogleFontLoader from "react-google-font-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { X } from "lucide-react"; // Assuming you have Lucide icons for the close button
import { FontItem, FontLoader, fontList } from "@/lib/fonts";
import { Label } from "@/components/ui/label";
import { useAtom, useAtomValue } from "jotai";
import { fontAtom, logoNameAtom } from "@/lib/statemanager";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

interface FontSelectorProps {
  className?: string;
}

export function FontSelector({ className }: FontSelectorProps) {
  const INCREMENT = 20;
  const [selectedFont, setSelectedFont] = useAtom(fontAtom);
  const [fontsToShow, setFontsToShow] = useState(INCREMENT);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const showMoreFonts = () => {
    setFontsToShow(fontsToShow + INCREMENT);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const clearSelectedFont = () => {
    setSelectedFont(undefined);
  };

  const filteredFonts = useMemo(() => {
    // Replace 'LucideIconList' with your font list data
    return fontList.filter((font) =>
      font.family.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (Window === undefined) return;
    const container = e.currentTarget;
    const nearEnd =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 200;

    if (nearEnd && !loading && fontsToShow < filteredFonts.length) {
      showMoreFonts();
    }
  };

  return (
    <div className="h-full w-full gap-4">
      <Label htmlFor="font-selector" className="">
        Select Font
      </Label>
      <div className="relative flex items-center justify-between">
        <Input
          id="font-selector"
          type="text"
          placeholder="Search fonts..."
          className=""
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          aria-label="Search fonts"
        />
        {searchTerm && (
          <X
            className="absolute right-2 z-20 cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            onClick={clearSearch}
          />
        )}
      </div>
      <div
        className="mt-4 grid h-full grid-cols-1 content-start gap-2 overflow-y-auto"
        onScroll={handleScroll}
      >
        <TooltipProvider>
          {filteredFonts.length === 0 ? (
            <div className="col-span-1 mt-4 w-full text-center text-gray-400">
              No fonts found
            </div>
          ) : (
            filteredFonts
              .slice(0, fontsToShow)
              .map((font) => (
                <FontDisplay
                  key={font.family}
                  font={font}
                  selectedFont={selectedFont}
                  clearSelectedFont={clearSelectedFont}
                  setSelectedFont={setSelectedFont}
                  onChange={setSelectedFont}
                />
              ))
          )}
        </TooltipProvider>
      </div>
      {loading && (
        <div className="col-span-1 mt-4 w-full text-center text-gray-400">
          Loading...
        </div>
      )}
      {fontsToShow < filteredFonts.length && (
        <Button
          className="mt-4 w-full cursor-pointer rounded-md bg-blue-500 p-2 text-center text-white"
          onClick={showMoreFonts}
        >
          Load More
        </Button>
      )}
    </div>
  );
}

function FontDisplay({
  font,
  selectedFont,
  clearSelectedFont,
  setSelectedFont,
  onChange,
}: {
  font: FontItem;
  selectedFont: string | undefined;
  clearSelectedFont: () => void;
  setSelectedFont: (font: string) => void;
  onChange: (font: string) => void;
}) {
  const logoName = useAtomValue(logoNameAtom);
  return (
    <Tooltip key={font.family}>
      <TooltipTrigger asChild>
        <Button
          className={cn(
            "group relative mx-auto h-16 w-full items-center justify-center rounded-md text-2xl font-medium",
            {
              "bg-gray-200 text-gray-800 hover:bg-gray-200/90":
                font.family === selectedFont,
              "border bg-white text-primary hover:bg-gray-200":
                font.family !== selectedFont,
            },
          )}
          variant={"ghostV2"}
          onClick={() => {
            if (font.family !== selectedFont) {
              setSelectedFont(font.family);
              onChange(font.family); // Notify the parent component of the change
            } else {
              clearSelectedFont();
            }
          }}
          style={{ fontFamily: font.family }}
        >
          {logoName || font.family}
          <div
            className={cn(
              "absolute bottom-0 right-0 z-20 cursor-pointer rounded-full p-1 text-xs text-gray-400 group-hover:text-gray-600",
              inter.className,
            )}
            style={{ fontFamily: undefined }}
          >
            {font.family}
          </div>
        </Button>
      </TooltipTrigger>
      <FontLoader fonts={[{ font: font.family }]} />
      <TooltipContent side="bottom">{font.family}</TooltipContent>
    </Tooltip>
  );
}
