"use client";

import { LucideIconStatic } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  addToFavoritesAtom,
  currentVersionIndexAtom,
  DesignVersion,
  FavoriteVersion,
  favoriteVersionsAtom,
  isCurrentVersionFavoritedAtom,
  removeFromFavoritesAtom,
  restoreFavoriteAtom,
  restoreVersionAtom,
  versionHistoryAtom,
} from "@/lib/versionHistory";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { Bookmark, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LayoutVariants } from "../custom/SelectableLayoutCard";
import { Button } from "../ui/button";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export function VersionHistory() {
  const [history] = useAtom(versionHistoryAtom);
  const [currentIndex, setCurrentIndex] = useAtom(currentVersionIndexAtom);
  const [, restoreVersion] = useAtom(restoreVersionAtom);
  const [favorites] = useAtom(favoriteVersionsAtom);
  const [isCurrentFavorited] = useAtom(isCurrentVersionFavoritedAtom);
  const [, addToFavorites] = useAtom(addToFavoritesAtom);
  const [, removeFromFavorites] = useAtom(removeFromFavoritesAtom);
  const [, restoreFavorite] = useAtom(restoreFavoriteAtom);
  const [activeTab, setActiveTab] = useState<string>("history");
  const [favoriteName, setFavoriteName] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentCardRef = useRef<HTMLDivElement>(null);
  const prevHistoryLengthRef = useRef<number>(0);

  const handleVersionClick = (index: number) => {
    restoreVersion(index);
  };

  const handleFavoriteClick = (favorite: FavoriteVersion) => {
    restoreFavorite(favorite);
  };

  const handleFavoriteCurrentVersion = () => {
    if (isCurrentFavorited) {
      // We need to find the favorite id to remove it
      const currentVersion = history[currentIndex];
      const matchingFav = favorites.find(
        (fav) =>
          JSON.stringify({
            text: fav.text,
            card: fav.card,
            icon: fav.icon,
            layout: fav.layout,
            font: fav.font?.family,
          }) ===
          JSON.stringify({
            text: currentVersion.text,
            card: currentVersion.card,
            icon: currentVersion.icon,
            layout: currentVersion.layout,
            font: currentVersion.font?.family,
          }),
      );

      if (matchingFav) {
        removeFromFavorites(matchingFav.favoriteId);
      }
    } else {
      setIsDialogOpen(true);
    }
  };

  const addWithName = () => {
    addToFavorites(favoriteName);
    setFavoriteName("");
    setIsDialogOpen(false);
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

  // Center the active card when current version changes or new versions are added
  useEffect(() => {
    // Skip if there's no history
    if (history.length === 0) return;

    // Track if a new version was added
    const newVersionAdded = history.length > prevHistoryLengthRef.current;
    prevHistoryLengthRef.current = history.length;

    // Only run centering if we have both references and either
    // the current index changed or a new version was added
    if (currentCardRef.current && scrollContainerRef.current) {
      // Small delay to ensure DOM is fully updated, especially for new cards
      setTimeout(() => {
        if (!currentCardRef.current || !scrollContainerRef.current) return;

        // Get scroll container dimensions
        const scrollContainer = scrollContainerRef.current;
        const containerWidth = scrollContainer.offsetWidth;

        // Calculate centering position
        const card = currentCardRef.current;
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = card.offsetLeft + cardRect.width / 2;
        const scrollCenterX = containerWidth / 2;

        // Calculate the scrollLeft position that centers the card
        const targetScrollLeft = cardCenterX - scrollCenterX;

        // Use different scrolling behavior for new versions vs selecting an existing version
        scrollContainer.scrollTo({
          left: targetScrollLeft,
          behavior: newVersionAdded ? "auto" : "smooth",
        });
      }, 50); // Short delay to ensure layout is complete
    }
  }, [currentIndex, history.length]);

  // If no history, don't render anything
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 w-full max-w-full">
      <Tabs
        defaultValue="history"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex justify-between items-center mb-2">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="favorites">
              Favorites ({favorites.length})
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-2">
            {activeTab === "history" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFavoriteCurrentVersion}
                  className={cn(
                    "w-8 h-8 rounded-full",
                    isCurrentFavorited
                      ? "text-yellow-500"
                      : "text-muted-foreground",
                  )}
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      isCurrentFavorited && "fill-yellow-500",
                    )}
                  />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {history.length} versions
                </span>
              </>
            )}
          </div>
        </div>

        <TabsContent value="history" className="mt-0">
          <div className="relative w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 z-10 w-8 h-8 transform -translate-y-1/2 bg-background/80"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <ScrollArea className="pb-2 w-full">
              <div
                className="flex px-6 py-3 space-x-3"
                ref={scrollContainerRef}
              >
                {history.map((version, index) => (
                  <div
                    key={version.id}
                    ref={index === currentIndex ? currentCardRef : null}
                  >
                    <VersionCard
                      version={version}
                      isActive={index === currentIndex}
                      onClick={() => handleVersionClick(index)}
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <Button
              variant="ghost"
              size="icon"
              onClick={scrollRight}
              className="absolute right-0 top-1/2 z-10 w-8 h-8 transform -translate-y-1/2 bg-background/80"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-0">
          {favorites.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Bookmark className="mx-auto mb-2 w-8 h-8 opacity-50" />
              <p>No favorites yet</p>
              <p className="mt-1 text-xs">
                Star your favorite versions to save them here
              </p>
            </div>
          ) : (
            <div className="relative w-full">
              <ScrollArea className="pb-2 w-full">
                <div className="grid grid-cols-2 gap-4 p-2 sm:grid-cols-3 md:grid-cols-4">
                  {favorites.map((favorite) => (
                    <FavoriteCard
                      key={favorite.favoriteId}
                      favorite={favorite}
                      onClick={() => handleFavoriteClick(favorite)}
                      onRemove={() => removeFromFavorites(favorite.favoriteId)}
                    />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save as Favorite</DialogTitle>
            <DialogDescription>
              Give your favorite design a name to help you remember it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="favorite-name" className="text-right">
                Name
              </Label>
              <Input
                id="favorite-name"
                value={favoriteName}
                onChange={(e) => setFavoriteName(e.target.value)}
                placeholder={`Favorite #${favorites.length + 1}`}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={addWithName}>
              Save Favorite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  const [fontCSS, setFontCSS] = useState<string | null>(null);

  // Fetch font CSS to properly render the fonts in miniature
  useEffect(() => {
    if (version.font?.family) {
      const fetchFont = async () => {
        try {
          const res = await fetch(
            `https://fonts.googleapis.com/css?family=${version.font?.family.replace(
              " ",
              "+",
            )}`,
          );
          const fontCss = await res.text();
          setFontCSS(fontCss);
        } catch (error) {
          console.error("Error fetching font for version history:", error);
        }
      };

      fetchFont();
    }
  }, [version.font?.family]);

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        className={cn(
          "flex relative flex-col transition-all group",
          isActive
            ? "ring-2 scale-105 ring-primary"
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
          {/* Icon (if layout includes icon) */}
          {version.layout !== "text" && version.icon && (
            <div
              className="flex absolute justify-center items-center"
              style={{
                top:
                  version.layout === "ltr" || version.layout === "rtl"
                    ? "50%"
                    : "30%",
                left:
                  version.layout === "ttd" || version.layout === "dtt"
                    ? "50%"
                    : version.layout === "ltr"
                    ? "25%"
                    : "75%",
                transform:
                  version.layout === "ttd" || version.layout === "dtt"
                    ? "translate(-50%, -50%)"
                    : version.layout === "ltr" || version.layout === "rtl"
                    ? "translate(-50%, -50%)"
                    : "translate(-50%, -50%)",
              }}
            >
              <LucideIconStatic
                name={version.icon.icon}
                size={Math.max(version.icon.size * scaleFactor, 8)}
                style={{ color: version.icon.color.hex }}
              />
            </div>
          )}

          {/* Text (if layout includes text) */}
          {version.layout !== "icon" &&
            version.layout !== "circle" &&
            version.text && (
              <div
                className="flex overflow-hidden justify-center items-center w-full h-full text-center"
                style={{
                  color: version.text.color.hex,
                  fontFamily: version.font?.family || undefined,
                  fontSize: `${Math.max(version.text.size * scaleFactor, 8)}px`, // Min font size
                }}
              >
                {version.text.text.length > (width > 80 ? 10 : 6)
                  ? version.text.text.substring(0, width > 80 ? 10 : 6) + "..."
                  : version.text.text}
              </div>
            )}
        </div>

        {/* Version label */}
        <div
          className={cn(
            "flex absolute -top-2 -right-2 justify-center items-center w-5 h-5 font-semibold rounded-full border bg-background text-[10px]",
            isActive ? "border-primary" : "border-muted-foreground/30",
          )}
        >
          {version.id}
        </div>

        {/* Load font for the thumbnail */}
        {version.font?.family && <style>{fontCSS}</style>}
      </button>

      {/* Timestamp */}
      <div className="mt-1 text-[10px] text-muted-foreground">
        {format(new Date(version.timestamp), "HH:mm:ss")}
      </div>
    </div>
  );
}

// Favorite card component
function FavoriteCard({
  favorite,
  onClick,
  onRemove,
}: {
  favorite: FavoriteVersion;
  onClick: () => void;
  onRemove: () => void;
}) {
  // Calculate scaled dimensions for card
  const scaleFactor = 0.2; // 20% of original size
  const width = Math.max(favorite.card.width.value * scaleFactor, 80); // Min width 80px
  const height = Math.max(favorite.card.height.value * scaleFactor, 45); // Min height 45px
  const [fontCSS, setFontCSS] = useState<string | null>(null);

  // Fetch font CSS to properly render the fonts
  useEffect(() => {
    if (favorite.font?.family) {
      const fetchFont = async () => {
        try {
          const res = await fetch(
            `https://fonts.googleapis.com/css?family=${favorite.font?.family.replace(
              " ",
              "+",
            )}`,
          );
          const fontCss = await res.text();
          setFontCSS(fontCss);
        } catch (error) {
          console.error("Error fetching font for favorite:", error);
        }
      };

      fetchFont();
    }
  }, [favorite.font?.family]);

  return (
    <div className="flex flex-col p-3 rounded-lg border transition-colors hover:bg-accent/50">
      <div className="flex justify-between items-start mb-2">
        <h4 className="pr-2 text-sm font-medium truncate">{favorite.name}</h4>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </Button>
      </div>

      <button
        onClick={onClick}
        className="flex justify-center items-center self-center transition-all hover:ring-1 hover:ring-primary/50"
      >
        {/* Favorite card preview */}
        <div
          className={cn(
            LayoutVariants({ layout: favorite.layout }),
            "overflow-hidden rounded-md shadow-md",
          )}
          style={{
            backgroundColor: favorite.card.color.hex,
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          {/* Icon (if layout includes icon) */}
          {favorite.layout !== "text" && favorite.icon && (
            <div
              className="flex absolute justify-center items-center"
              style={{
                top:
                  favorite.layout === "ltr" || favorite.layout === "rtl"
                    ? "50%"
                    : "30%",
                left:
                  favorite.layout === "ttd" || favorite.layout === "dtt"
                    ? "50%"
                    : favorite.layout === "ltr"
                    ? "25%"
                    : "75%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <LucideIconStatic
                name={favorite.icon.icon}
                size={Math.max(favorite.icon.size * scaleFactor, 10)}
                style={{ color: favorite.icon.color.hex }}
              />
            </div>
          )}

          {/* Text (if layout includes text) */}
          {favorite.layout !== "icon" &&
            favorite.layout !== "circle" &&
            favorite.text && (
              <div
                className="flex overflow-hidden justify-center items-center w-full h-full text-center"
                style={{
                  color: favorite.text.color.hex,
                  fontFamily: favorite.font?.family || undefined,
                  fontSize: `${Math.max(
                    favorite.text.size * scaleFactor,
                    10,
                  )}px`,
                }}
              >
                {favorite.text.text.length > 12
                  ? favorite.text.text.substring(0, 12) + "..."
                  : favorite.text.text}
              </div>
            )}
        </div>

        {/* Load font for the thumbnail */}
        {favorite.font?.family && <style>{fontCSS}</style>}
      </button>

      <div className="mt-2 text-xs text-center text-muted-foreground">
        {format(new Date(favorite.timestamp), "MMM d, yyyy")}
      </div>
    </div>
  );
}
