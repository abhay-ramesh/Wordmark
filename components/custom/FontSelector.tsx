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
import { FontLoader } from "@/lib/fonts";
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
  >("all");
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
    <div className={cn("flex flex-col w-full h-full", className)}>
      {/* Font Provider Selector */}
      <div className="flex-none px-2 py-1 space-y-2">
        <FontProviderSelector
          className="mb-0"
          onChange={handleProviderChange}
        />
      </div>

      {/* Search and Controls */}
      <div className="flex-none space-y-1.5 px-2 py-1">
        {/* Search Input */}
        <div className="relative">
          <Input
            id="font-selector"
            type="text"
            placeholder="Search fonts..."
            className="pr-8 h-8 text-sm border-muted bg-background/50"
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

        {/* Controls */}
        <div className="flex justify-between items-center">
          <label className="flex items-center space-x-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={searchAll}
              onChange={() => setSearchAll(!searchAll)}
              className="w-3 h-3 rounded border-muted text-primary"
            />
            <span>Search all</span>
          </label>

          <div className="flex gap-2 items-center">
            <div className="flex gap-1 items-center">
              <Label
                htmlFor="preview-toggle"
                className="flex gap-1 items-center text-xs cursor-pointer text-muted-foreground"
              >
                {showSampleText ? (
                  <>
                    <Text className="w-3 h-3" />
                    <span className="hidden sm:inline">Preview</span>
                  </>
                ) : (
                  <>
                    <Type className="w-3 h-3" />
                    <span className="hidden sm:inline">Names</span>
                  </>
                )}
              </Label>
              <Switch
                id="preview-toggle"
                checked={showSampleText}
                onCheckedChange={setShowSampleText}
                className="scale-70"
              />
            </div>

            <span className="text-xs text-muted-foreground">
              {allFonts.length > 0 && fontCountInfo}
            </span>
          </div>
        </div>
      </div>

      {/* Font List */}
      <div
        ref={fontContainerRef}
        className="overflow-y-auto flex-1 border-t border-border/30 bg-background/20"
        onScroll={handleScroll}
      >
        <div className="grid gap-0.5 p-1">
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
                          "w-full rounded px-3 py-2 text-left transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          selectedFont?.family === font.family
                            ? "bg-accent text-accent-foreground"
                            : "bg-transparent",
                        )}
                        onClick={() => setSelectedFont(font)}
                      >
                        {showSampleText ? (
                          <div className="flex flex-col gap-0.5">
                            <span
                              style={{
                                fontFamily: font.family,
                                fontSize: "16px",
                                lineHeight: "1.2",
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxHeight: "38px",
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
                              fontSize: "15px",
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

      {/* Selected Font Bar */}
      {selectedFont && (
        <div className="flex-none border-t border-border/30 bg-accent/10 px-2 py-1.5">
          <div className="flex justify-between items-center">
            <div
              className="text-sm font-medium truncate"
              style={{
                fontFamily: selectedFont.family,
                fontSize: "16px",
              }}
            >
              {selectedFont.family}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="px-2 h-6 text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              onClick={clearSelectedFont}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <FontLoader fonts={[{ font: "Inter" }]} />
    </div>
  );
}

// Export both as named export and default export
export const FontSelector = FontSelectorComponent;
export default FontSelectorComponent;
