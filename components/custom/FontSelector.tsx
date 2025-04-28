"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ExtendedFontItem,
  getAllFontList,
  getAvailableProviders,
  getFontsByProvider,
  loadMoreFontsByProvider,
} from "@/lib/fontProviders";
import { FontItem, FontLoader } from "@/lib/fonts";
import { fontAtom, textAtom } from "@/lib/statemanager";
import { cn } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useAtom, useAtomValue } from "jotai";
import { Loader2, Search, Text, Type, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Inter } from "next/font/google";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FontProviderSelector } from "./FontProviderSelector";

const inter = Inter({ subsets: ["latin"] });

interface FontSelectorProps {
  className?: string;
}

// Named function component to fix linter error
function FontSelectorComponent({ className }: FontSelectorProps) {
  const { theme } = useTheme();
  const INCREMENT = 20;
  const [selectedFont, setSelectedFont] = useAtom(fontAtom);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchAll, setSearchAll] = useState(false);
  const [showSampleText, setShowSampleText] = useState(false);
  const [loading, setLoading] = useState(false);
  const textState = useAtomValue(textAtom);
  const [activeProvider, setActiveProvider] = useState<
    "google" | "adobe" | "fontSquirrel" | "custom" | "fontSource" | "all"
  >("custom");
  const [hasMoreFonts, setHasMoreFonts] = useState(true);
  const [allProviders, setAllProviders] = useState<string[]>([]);
  const fontContainerRef = useRef<HTMLDivElement>(null);

  // Get sample text - use typed text if available, otherwise use placeholder
  const sampleText = useMemo(() => {
    return textState.text || "The quick brown fox jumps";
  }, [textState.text]);

  // Initialize providers
  useEffect(() => {
    setAllProviders(getAvailableProviders());
  }, []);

  // Fuse.js options for fuzzy search
  const fuseOptions = {
    keys: ["family"],
    threshold: 0.3,
    isCaseSensitive: false,
  };

  // React Query for infinite loading
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["fonts", activeProvider, searchTerm, searchAll],
      queryFn: async ({ pageParam = 0 }) => {
        setLoading(true);
        try {
          // Get appropriate font list based on provider and search settings
          let fonts: ExtendedFontItem[] = [];

          if (activeProvider === "all" || searchAll) {
            fonts = getAllFontList();
          } else {
            fonts = getFontsByProvider(activeProvider);

            // Try to load more fonts if this is not the first page
            if (pageParam > 0 && activeProvider === "fontSquirrel") {
              await loadMoreFontsByProvider(activeProvider);
              fonts = getFontsByProvider(activeProvider);
            }
          }

          // Apply fuzzy search if search term exists
          if (searchTerm) {
            const fuse = new Fuse(fonts, fuseOptions);
            const result = fuse.search(searchTerm);
            fonts = result.map((item) => item.item);
          }

          // Calculate pagination
          const offset = pageParam * INCREMENT;
          const end = offset + INCREMENT;
          const items = fonts.slice(offset, end);
          const hasMore = end < fonts.length;

          return {
            items,
            nextPage: hasMore ? pageParam + 1 : null,
            totalCount: fonts.length,
          };
        } finally {
          setLoading(false);
        }
      },
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 0,
    });

  // Combine all pages of fonts
  const allFonts = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  // Number of total fonts
  const totalFonts = useMemo(() => {
    return data?.pages[0]?.totalCount || 0;
  }, [data]);

  // Reset state when provider changes
  useEffect(() => {
    setHasMoreFonts(true);
  }, [activeProvider]);

  // Handle scroll event to load more fonts when reaching the bottom
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      // Load more when user scrolls to 80% of the way down
      const scrollThreshold = 0.8;
      const nearEnd =
        scrollTop + clientHeight >= scrollHeight * scrollThreshold;

      if (nearEnd && !loading && !isFetchingNextPage && hasNextPage) {
        fetchNextPage();
      }
    },
    [loading, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  // Show the total count of fonts and how many are being displayed
  const fontCountInfo = useMemo(() => {
    const showing = allFonts.length;
    const total = totalFonts;

    let status = `${showing} of ${total}`;

    if (searchTerm) {
      status += ` matching "${searchTerm}"`;
    }

    return status;
  }, [allFonts.length, totalFonts, searchTerm, searchAll]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  const clearSelectedFont = () => {
    setSelectedFont(undefined);
  };

  const handleProviderChange = (provider: string) => {
    if (provider === "all") {
      setActiveProvider("all");
    } else {
      setActiveProvider(
        provider as
          | "google"
          | "adobe"
          | "fontSquirrel"
          | "custom"
          | "fontSource",
      );
    }
  };

  return (
    <div className="grid gap-2 w-full h-full">
      <Label
        htmlFor="font-selector"
        className="text-sm font-medium text-muted-foreground"
      >
        Typography
      </Label>

      {/* Provider selector tabs */}
      <FontProviderSelector className="mb-0" onChange={handleProviderChange} />

      <div className="relative">
        <Input
          id="font-selector"
          type="text"
          placeholder="Search fonts..."
          className="pr-8 h-9 border-muted bg-background/50"
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          aria-label="Search fonts"
        />
        <div className="flex absolute inset-y-0 right-0 items-center pr-2">
          {searchTerm ? (
            <X
              className="w-4 h-4 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={clearSearch}
            />
          ) : (
            <Search className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <label className="flex items-center space-x-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={searchAll}
            onChange={() => setSearchAll(!searchAll)}
            className="w-3 h-3 rounded border-muted text-primary"
          />
          <span>Search all providers</span>
        </label>

        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1.5">
            <Label
              htmlFor="preview-toggle"
              className="flex gap-1 items-center text-xs cursor-pointer text-muted-foreground"
            >
              {showSampleText ? (
                <>
                  <Text className="w-3 h-3" />
                  <span>Preview text</span>
                </>
              ) : (
                <>
                  <Type className="w-3 h-3" />
                  <span>Font names</span>
                </>
              )}
            </Label>
            <Switch
              id="preview-toggle"
              checked={showSampleText}
              onCheckedChange={setShowSampleText}
              className="scale-75"
            />
          </div>

          <span className="text-xs text-muted-foreground">{fontCountInfo}</span>
        </div>
      </div>

      <div
        ref={fontContainerRef}
        className="mt-1 h-[calc(100%-8rem)] overflow-y-auto rounded-md border border-border/50 bg-background/30"
        onScroll={handleScroll}
      >
        <div className="grid gap-1 p-1.5">
          <TooltipProvider>
            {status === "pending" ? (
              <div className="flex flex-col justify-center items-center py-10 text-muted-foreground">
                <Loader2 className="mb-2 w-5 h-5 animate-spin" />
                <p className="text-xs">Loading fonts</p>
              </div>
            ) : status === "error" ? (
              <div className="flex justify-center items-center py-10 text-destructive">
                <p className="text-sm">Error loading fonts</p>
              </div>
            ) : allFonts.length === 0 ? (
              <div className="flex justify-center items-center py-10 text-muted-foreground">
                <p className="text-sm">No fonts found</p>
              </div>
            ) : (
              allFonts.map((font) => (
                <React.Fragment key={font.family}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          "w-full rounded-sm px-4 py-3 text-left transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          selectedFont?.family === font.family
                            ? "bg-accent text-accent-foreground"
                            : "bg-transparent",
                        )}
                        onClick={() => setSelectedFont(font)}
                      >
                        {showSampleText ? (
                          <div className="flex flex-col gap-1">
                            <span
                              style={{
                                fontFamily: font.family,
                                fontSize: "17px",
                                lineHeight: "1.3",
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {sampleText}
                            </span>
                            <span
                              className={cn(
                                "text-xs opacity-70",
                                selectedFont?.family === font.family
                                  ? "text-accent-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              {font.family}
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              fontFamily: font.family,
                              fontSize: "16px",
                              lineHeight: "1.2",
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {font.family}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">
                          {font.family}
                        </span>
                        <span className="text-xs opacity-70">
                          {font.provider || "Unknown"}
                        </span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <FontLoader fonts={[{ font: font.family }]} />
                </React.Fragment>
              ))
            )}
          </TooltipProvider>

          {isFetchingNextPage && (
            <div className="col-span-1 py-2 w-full text-center">
              <Loader2 className="mx-auto w-4 h-4 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {selectedFont && (
        <div className="mt-1 flex items-center justify-between rounded-md bg-accent/20 px-2 py-1.5">
          <div className="flex items-center space-x-2">
            <div
              className="text-sm font-medium truncate"
              style={{
                fontFamily: selectedFont.family,
                fontSize: "18px",
              }}
            >
              {selectedFont.family}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 h-7 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            onClick={clearSelectedFont}
          >
            Clear
          </Button>
        </div>
      )}

      <FontLoader fonts={[{ font: "Inter" }]} />
    </div>
  );
}

// Export both as named export and default export
export const FontSelector = FontSelectorComponent;
export default FontSelectorComponent;

// Optimized FontDisplay component with memoization
const FontDisplay = React.memo(
  ({
    font,
    selectedFont,
    clearSelectedFont,
    setSelectedFont,
    onChange,
  }: {
    font: ExtendedFontItem;
    selectedFont: FontItem | undefined;
    clearSelectedFont: () => void;
    setSelectedFont: (font: FontItem) => void;
    onChange: (font: FontItem) => void;
  }) => {
    const { text: logoName } = useAtomValue(textAtom);

    return (
      <Tooltip key={font.family}>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "group relative mx-auto h-16 w-full items-center justify-center rounded-md text-2xl font-medium",
              {
                "bg-blue-600 text-white hover:bg-blue-600/90 hover:text-white/90":
                  font.family === selectedFont?.family,
              },
            )}
            variant={"ghostV2"}
            onClick={() => {
              if (font.family !== selectedFont?.family) {
                setSelectedFont(font);
                onChange(font); // Notify the parent component of the change
              } else {
                clearSelectedFont();
              }
            }}
            style={{ fontFamily: font.family }}
          >
            {logoName || font.family}
            <div
              className={cn(
                "absolute bottom-0 right-0 z-10 cursor-pointer rounded-full p-1 text-xs text-primary/60 group-hover:text-white/90",
                {
                  "text-white/70": font.family === selectedFont?.family,
                },
                inter.className,
              )}
              style={{ fontFamily: undefined }}
            >
              {font.family}
              {font.provider && font.provider !== "google" && (
                <span className="ml-1 text-[10px] opacity-70">
                  ({font.provider})
                </span>
              )}
            </div>
          </Button>
        </TooltipTrigger>
        {font.provider === "google" && (
          <FontLoader fonts={[{ font: font.family }]} />
        )}
        <TooltipContent side="bottom">{font.family}</TooltipContent>
      </Tooltip>
    );
  },
);

// Add display name to fix linter error
FontDisplay.displayName = "FontDisplay";
