"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  clearFontCache,
  ExtendedFontItem,
  getAllFontList,
  getAvailableProviders,
  getFontsByProvider,
  loadMoreFontsByProvider,
} from "@/lib/fontProviders";
import { onFontProviderEvent } from "@/lib/fontProviders/events";
import { FontLoader } from "@/lib/fonts";
import { fontAtom, textAtom } from "@/lib/statemanager";
import { cn } from "@/lib/utils";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useAtom, useAtomValue } from "jotai";
import { Loader2, Search, Shuffle, SlidersHorizontal, X } from "lucide-react";
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
  const [selectedFont, setSelectedFont] = useAtom<ExtendedFontItem | undefined>(
    fontAtom,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showSampleText, setShowSampleText] = useState(false);
  const [loading, setLoading] = useState(false);
  const [randomizing, setRandomizing] = useState(false);
  const textState = useAtomValue(textAtom);
  const [activeProvider, setActiveProvider] = useState<
    | "google"
    | "adobe"
    | "fontSquirrel"
    | "custom"
    | "fontSource"
    | "openFoundry"
    | "all"
  >("all");
  // Font filtering states
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [weightFilter, setWeightFilter] = useState<string>("all");
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  // Add open state for each filter select
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);

  const [hasMoreFonts, setHasMoreFonts] = useState(true);
  const [allProviders, setAllProviders] = useState<string[]>([]);
  const fontContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Available font categories
  const fontCategories = useMemo(
    () => [
      { value: "all", label: "All Categories" },
      { value: "serif", label: "Serif" },
      { value: "sans-serif", label: "Sans Serif" },
      { value: "monospace", label: "Monospace" },
      { value: "display", label: "Display" },
      { value: "handwriting", label: "Handwriting" },
      { value: "script", label: "Script" },
      { value: "decorative", label: "Decorative" },
      { value: "slab-serif", label: "Slab Serif" },
      { value: "blackletter", label: "Blackletter" },
    ],
    [],
  );

  // Font weights
  const fontWeights = useMemo(
    () => [
      { value: "all", label: "All Weights" },
      { value: "thin", label: "Thin" },
      { value: "light", label: "Light" },
      { value: "regular", label: "Regular" },
      { value: "medium", label: "Medium" },
      { value: "semibold", label: "Semibold" },
      { value: "bold", label: "Bold" },
      { value: "extrabold", label: "Extra Bold" },
      { value: "black", label: "Black" },
    ],
    [],
  );

  // Font styles
  const fontStyles = useMemo(
    () => [
      { value: "all", label: "All Styles" },
      { value: "normal", label: "Normal" },
      { value: "italic", label: "Italic" },
    ],
    [],
  );

  // Provider display names for formatting
  const providerNames: Record<string, string> = {
    google: "Google Fonts",
    adobe: "Adobe Fonts",
    fontSquirrel: "Font Squirrel",
    custom: "Custom Fonts",
    fontSource: "Fontsource",
    openFoundry: "Open Foundry",
    all: "All Fonts",
  };

  // Get sample text - use typed text if available, otherwise use placeholder
  const sampleText = useMemo(() => {
    return textState.text || "The quick brown fox jumps";
  }, [textState.text]);

  // Initialize providers and listen for font updates
  useEffect(() => {
    setAllProviders(getAvailableProviders());

    // Listen for font provider update events
    const unsubscribe1 = onFontProviderEvent("fontSourceUpdated", () => {
      // Clear cache and refetch
      clearFontCache("all");
      clearFontCache(`provider_${activeProvider}`);
      setAllProviders(getAvailableProviders());

      // Invalidate the query to force a refetch
      queryClient.invalidateQueries({
        queryKey: ["fonts", activeProvider, searchTerm],
      });
    });

    const unsubscribe2 = onFontProviderEvent("fontProviderUpdated", () => {
      // Clear cache and refetch
      clearFontCache("all");
      clearFontCache(`provider_${activeProvider}`);
      setAllProviders(getAvailableProviders());

      // Invalidate the query to force a refetch
      queryClient.invalidateQueries({
        queryKey: ["fonts", activeProvider, searchTerm],
      });
    });

    const unsubscribe3 = onFontProviderEvent("openFoundryUpdated", () => {
      // Clear cache and refetch
      clearFontCache("all");
      clearFontCache(`provider_${activeProvider}`);
      setAllProviders(getAvailableProviders());

      // Invalidate the query to force a refetch
      queryClient.invalidateQueries({
        queryKey: ["fonts", activeProvider, searchTerm],
      });
    });

    // Cleanup
    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
  }, [activeProvider, searchTerm, queryClient]);

  // Fuse.js options for fuzzy search
  const fuseOptions = {
    keys: ["family"],
    threshold: 0.3,
    isCaseSensitive: false,
  };

  // Reset filters when provider changes
  useEffect(() => {
    setCategoryFilter("all");
    setWeightFilter("all");
    setStyleFilter("all");
  }, [activeProvider]);

  // Category mappings for different provider naming conventions
  const categoryMappings: Record<string, string[]> = useMemo(
    () => ({
      serif: [
        "serif",
        "oldstyle",
        "transitional",
        "didone",
        "slab serif",
        "clarendon",
        "slab-serif",
        "antique",
      ],
      "sans-serif": [
        "sans-serif",
        "sans serif",
        "grotesque",
        "neo-grotesque",
        "geometric",
        "humanist",
      ],
      monospace: [
        "monospace",
        "mono",
        "fixed-width",
        "code",
        "console",
        "typewriter",
      ],
      display: [
        "display",
        "decorative",
        "fancy",
        "title",
        "poster",
        "headline",
        "wood type",
      ],
      handwriting: [
        "handwriting",
        "script",
        "hand",
        "brush",
        "calligraphy",
        "cursive",
      ],
      script: ["script", "brush script", "calligraphy", "handwritten"],
      decorative: ["decorative", "display", "fancy", "ornamental", "novelty"],
      "slab-serif": [
        "slab-serif",
        "slab serif",
        "egyptian",
        "clarendon",
        "mechanical",
      ],
      blackletter: [
        "blackletter",
        "gothic",
        "old english",
        "fraktur",
        "textura",
      ],
    }),
    [],
  );

  // React Query for infinite loading
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [
        "fonts",
        activeProvider,
        searchTerm,
        categoryFilter,
        weightFilter,
        styleFilter,
      ],
      queryFn: async ({ pageParam = 0 }) => {
        setLoading(true);
        try {
          // Get appropriate font list based on provider
          let fonts: ExtendedFontItem[] = [];

          if (activeProvider === "all") {
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

          // Apply category filter with improved mapping
          if (categoryFilter !== "all") {
            const targetCategories = categoryMappings[categoryFilter] || [
              categoryFilter,
            ];
            fonts = fonts.filter((font) => {
              // Check explicit category
              if (targetCategories.includes(font.category?.toLowerCase())) {
                return true;
              }

              // Check if family name contains category keywords
              const familyName = font.family.toLowerCase();
              return targetCategories.some((cat) =>
                familyName.includes(cat.toLowerCase()),
              );
            });
          }

          // Apply weight filter (approximate since weights are stored differently by providers)
          if (weightFilter !== "all") {
            const weightVariantMap: Record<string, string[]> = {
              thin: [
                "100",
                "200",
                "thin",
                "extralight",
                "hairline",
                "ultra-thin",
              ],
              light: ["300", "light"],
              regular: ["400", "regular", "normal", "book", "text", "roman"],
              medium: ["500", "medium"],
              semibold: [
                "600",
                "semibold",
                "demibold",
                "semi-bold",
                "demi-bold",
              ],
              bold: ["700", "bold", "strong"],
              extrabold: [
                "800",
                "extrabold",
                "extra-bold",
                "ultra-bold",
                "heavy",
              ],
              black: [
                "900",
                "black",
                "heavy",
                "ultra",
                "ultra-black",
                "fat",
                "poster",
              ],
            };

            const targetWeights = weightVariantMap[weightFilter] || [];

            fonts = fonts.filter((font) => {
              // Check variants directly
              const hasMatchingVariant = font.variants.some((v) =>
                targetWeights.some((tw) =>
                  v.toLowerCase().includes(tw.toLowerCase()),
                ),
              );

              // For Google/variable fonts, also check if family name includes weight terms
              const familyIncludesWeight = targetWeights.some((tw) =>
                font.family.toLowerCase().includes(tw.toLowerCase()),
              );

              return hasMatchingVariant || familyIncludesWeight;
            });
          }

          // Apply style filter with improved mapping
          if (styleFilter !== "all") {
            const styleVariantMap: Record<string, string[]> = {
              normal: ["normal", "regular", "roman", "upright"],
              italic: ["italic", "oblique", "slanted"],
            };

            const targetStyles = styleVariantMap[styleFilter] || [styleFilter];

            fonts = fonts.filter((font) => {
              // Check for style terms in variants
              const hasVariant = font.variants.some((v) =>
                targetStyles.some((ts) =>
                  v.toLowerCase().includes(ts.toLowerCase()),
                ),
              );

              // Check family name for style terms
              const familyName = font.family.toLowerCase();
              const familyHasStyle = targetStyles.some((ts) =>
                familyName.includes(ts.toLowerCase()),
              );

              return hasVariant || familyHasStyle;
            });
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
  const allFonts = useMemo<ExtendedFontItem[]>(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  // Number of total fonts
  const totalFonts = useMemo(() => {
    return data?.pages[0]?.totalCount || 0;
  }, [data]);

  // Get all fonts from all providers for accurate counting
  const getAllProviderFonts = useCallback((): ExtendedFontItem[] => {
    let allProviderFonts: ExtendedFontItem[] = [];

    // Get fonts from each provider directly (not filtered by search)
    if (activeProvider === "all") {
      // Combine fonts from all providers
      allProviderFonts = getAllFontList();
    } else {
      // Get fonts only from the selected provider
      allProviderFonts = getFontsByProvider(activeProvider);
    }

    return allProviderFonts;
  }, [activeProvider]);

  // Calculate category counts from total data
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: 0, // Will be updated with total count
    };

    // Initialize counts for all categories
    fontCategories.forEach((cat) => {
      if (cat.value !== "all") {
        counts[cat.value] = 0;
      }
    });

    // Get all provider fonts for accurate counting
    const allProviderFonts = getAllProviderFonts();
    counts.all = allProviderFonts.length;

    // Count fonts in each category
    allProviderFonts.forEach((font) => {
      // Check each category mapping
      Object.entries(categoryMappings).forEach(([category, mappings]) => {
        // Check if font category matches any mapping
        if (
          mappings.includes(font.category?.toLowerCase() || "") ||
          mappings.some((m) =>
            font.family.toLowerCase().includes(m.toLowerCase()),
          )
        ) {
          counts[category] = (counts[category] || 0) + 1;
        }
      });

      // If the font didn't match any mapping, increment counts for its actual category
      if (
        font.category &&
        !Object.keys(categoryMappings).some((cat) =>
          categoryMappings[cat].includes(font.category?.toLowerCase() || ""),
        )
      ) {
        counts[font.category] = (counts[font.category] || 0) + 1;
      }
    });

    return counts;
  }, [getAllProviderFonts, fontCategories, categoryMappings]);

  // Calculate weight counts from total data
  const weightCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: 0, // Will be updated with total count
    };

    // Initialize counts for all weights
    fontWeights.forEach((weight) => {
      if (weight.value !== "all") {
        counts[weight.value] = 0;
      }
    });

    // Get all provider fonts for accurate counting
    const allProviderFonts = getAllProviderFonts();
    counts.all = allProviderFonts.length;

    // Define weight mappings
    const weightVariantMap: Record<string, string[]> = {
      thin: ["100", "200", "thin", "extralight", "hairline", "ultra-thin"],
      light: ["300", "light"],
      regular: ["400", "regular", "normal", "book", "text", "roman"],
      medium: ["500", "medium"],
      semibold: ["600", "semibold", "demibold", "semi-bold", "demi-bold"],
      bold: ["700", "bold", "strong"],
      extrabold: ["800", "extrabold", "extra-bold", "ultra-bold", "heavy"],
      black: ["900", "black", "heavy", "ultra", "ultra-black", "fat", "poster"],
    };

    // Count fonts for each weight
    allProviderFonts.forEach((font) => {
      Object.entries(weightVariantMap).forEach(([weight, terms]) => {
        // Check variants
        const hasMatchingVariant = font.variants.some((v) =>
          terms.some((term) => v.toLowerCase().includes(term.toLowerCase())),
        );

        // Check family name
        const familyIncludesWeight = terms.some((term) =>
          font.family.toLowerCase().includes(term.toLowerCase()),
        );

        if (hasMatchingVariant || familyIncludesWeight) {
          counts[weight] = (counts[weight] || 0) + 1;
        }
      });
    });

    return counts;
  }, [getAllProviderFonts, fontWeights]);

  // Calculate style counts from total data
  const styleCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: 0, // Will be updated with total count
    };

    // Initialize counts for all styles
    fontStyles.forEach((style) => {
      if (style.value !== "all") {
        counts[style.value] = 0;
      }
    });

    // Get all provider fonts for accurate counting
    const allProviderFonts = getAllProviderFonts();
    counts.all = allProviderFonts.length;

    // Define style mappings
    const styleVariantMap: Record<string, string[]> = {
      normal: ["normal", "regular", "roman", "upright"],
      italic: ["italic", "oblique", "slanted"],
    };

    // Count fonts for each style
    allProviderFonts.forEach((font) => {
      Object.entries(styleVariantMap).forEach(([style, terms]) => {
        // Check variants
        const hasVariant = font.variants.some((v) =>
          terms.some((term) => v.toLowerCase().includes(term.toLowerCase())),
        );

        // Check family name
        const familyName = font.family.toLowerCase();
        const familyHasStyle = terms.some((term) =>
          familyName.includes(term.toLowerCase()),
        );

        if (hasVariant || familyHasStyle) {
          counts[style] = (counts[style] || 0) + 1;
        }
      });
    });

    return counts;
  }, [getAllProviderFonts, fontStyles]);

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
  }, [allFonts.length, totalFonts, searchTerm]);

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
          | "fontSource"
          | "openFoundry",
      );
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setCategoryFilter("all");
    setWeightFilter("all");
    setStyleFilter("all");
  };

  // Random font selection
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
    <div
      className={cn("flex h-full w-full flex-col overflow-hidden", className)}
    >
      {/* Unified Search and Provider Selection */}
      <div className="flex-none space-y-2 p-2">
        {/* Search Input and Provider selector in a single row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-2.5">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              id="font-selector"
              type="text"
              placeholder="Search fonts..."
              className="h-8 pl-8 pr-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={clearSearch}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <FontProviderSelector
            className="w-[180px] flex-none"
            onChange={handleProviderChange}
          />
        </div>

        {/* Toggles row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </Button>
            {!selectedFont && (
              <Button
                variant="secondary"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
                onClick={selectRandomFont}
                disabled={randomizing}
              >
                {randomizing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Shuffle className="h-3.5 w-3.5" />
                )}
                <span className="text-xs">Random</span>
              </Button>
            )}
            {(categoryFilter !== "all" ||
              weightFilter !== "all" ||
              styleFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
                onClick={clearFilters}
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center space-x-1.5">
              <Switch
                id="sample-text"
                checked={showSampleText}
                onCheckedChange={setShowSampleText}
                className="scale-75"
              />
              <Label htmlFor="sample-text" className="text-xs">
                Preview Text
              </Label>
            </div>
          </div>
        </div>

        {/* Font Filters (collapsible) */}
        {showFilters && (
          <div className="space-y-1.5 rounded-md bg-muted/30 p-2">
            <div className="flex flex-wrap gap-2">
              {/* Category filter */}
              <div className="flex flex-col gap-1">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                  open={categoryOpen}
                  onOpenChange={setCategoryOpen}
                >
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontCategories.map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                        className="text-xs"
                      >
                        {category.label}
                        {categoryOpen &&
                          category.value !== "all" &&
                          categoryFilter !== category.value && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              {categoryCounts[category.value] || 0}
                            </span>
                          )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weight filter */}
              <div className="flex flex-col gap-1">
                <Select
                  value={weightFilter}
                  onValueChange={setWeightFilter}
                  open={weightOpen}
                  onOpenChange={setWeightOpen}
                >
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue placeholder="Weight" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontWeights.map((weight) => (
                      <SelectItem
                        key={weight.value}
                        value={weight.value}
                        className="text-xs"
                      >
                        {weight.label}
                        {weightOpen &&
                          weight.value !== "all" &&
                          weightFilter !== weight.value && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              {weightCounts[weight.value] || 0}
                            </span>
                          )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Style filter */}
              <div className="flex flex-col gap-1">
                <Select
                  value={styleFilter}
                  onValueChange={setStyleFilter}
                  open={styleOpen}
                  onOpenChange={setStyleOpen}
                >
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue placeholder="Style" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontStyles.map((style) => (
                      <SelectItem
                        key={style.value}
                        value={style.value}
                        className="text-xs"
                      >
                        {style.label}
                        {styleOpen &&
                          style.value !== "all" &&
                          styleFilter !== style.value && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              {styleCounts[style.value] || 0}
                            </span>
                          )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Show filtered count if any filter is active */}
            {(categoryFilter !== "all" ||
              weightFilter !== "all" ||
              styleFilter !== "all") && (
              <div className="text-xs text-muted-foreground">
                Showing {allFonts.length} of {totalFonts} fonts
              </div>
            )}
          </div>
        )}
      </div>

      {/* Font List */}
      <div
        ref={fontContainerRef}
        className="flex-1 overflow-y-auto bg-background/20"
        onScroll={handleScroll}
      >
        <div className="grid gap-0.5 p-1">
          <TooltipProvider>
            {status === "pending" ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="mb-2 h-5 w-5 animate-spin" />
                <p className="text-xs">Loading fonts</p>
              </div>
            ) : status === "error" ? (
              <div className="flex items-center justify-center py-10 text-destructive">
                <p className="text-sm">Error loading fonts</p>
              </div>
            ) : allFonts.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <p className="text-sm">No fonts found</p>
              </div>
            ) : (
              allFonts.map((font) => (
                <React.Fragment key={font.family}>
                  <button
                    className={cn(
                      "w-full rounded px-3 py-1.5 text-left transition-colors",
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
                            maxHeight: "30px",
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
                          {font.provider &&
                            ` · ${
                              providerNames[
                                font.provider as keyof typeof providerNames
                              ] || font.provider
                            }`}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
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
                        {font.provider && (
                          <span className="text-xs text-muted-foreground">
                            {providerNames[
                              font.provider as keyof typeof providerNames
                            ] || font.provider}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                  <FontLoader fonts={[{ font: font.family }]} />
                </React.Fragment>
              ))
            )}
          </TooltipProvider>

          {isFetchingNextPage && (
            <div className="col-span-1 w-full py-2 text-center">
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Selected Font Bar */}
      {selectedFont && (
        <div className="flex-none border-t border-border/30 bg-accent/10 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div
                className="truncate text-sm font-medium"
                style={{
                  fontFamily: selectedFont.family,
                  fontSize: "16px",
                }}
              >
                {selectedFont.family}
              </div>
              {selectedFont.provider && (
                <div className="text-xs text-muted-foreground">
                  {providerNames[
                    selectedFont.provider as keyof typeof providerNames
                  ] || selectedFont.provider}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={selectRandomFont}
                disabled={randomizing}
                title="Try a random font"
              >
                {randomizing ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Shuffle className="mr-1 h-3 w-3" />
                )}
                Random
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={clearSelectedFont}
              >
                Clear
              </Button>
            </div>
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
