import { Layouts } from "@/components/custom/SelectableLayoutCard";
import { LucideIconType } from "@/components/icons";
import html2canvas from "html2canvas";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { IColor } from "react-color-palette";
import { Units } from "./constants";
import { FontItem } from "./fonts";
import {
  cardAtom,
  fontAtom,
  iconAtom,
  layoutAtom,
  textAtom,
} from "./statemanager";

// Define the version data structure
export interface DesignVersion {
  id: number;
  timestamp: number;
  card: {
    color: IColor;
    width: {
      value: number;
      unit: (typeof Units)[number];
    };
    height: {
      value: number;
      unit: (typeof Units)[number];
    };
    ratioLocked: boolean;
  };
  text: {
    text: string;
    color: IColor;
    size: number;
  };
  font?: FontItem;
  icon: {
    icon: LucideIconType;
    color: IColor;
    size: number;
  };
  layout: Layouts;
  thumbnail?: string; // Base64 encoded image thumbnail
}

// Favorite version data structure - storing only essential info to save space
export interface FavoriteVersion extends DesignVersion {
  name?: string; // Optional custom name for the favorite
  favoriteId: string; // Unique ID for the favorite (different from version id)
}

// Maximum number of versions to keep in history
const MAX_HISTORY_SIZE = 30;

// Main history atom
export const versionHistoryAtom = atom<DesignVersion[]>([]);

// Current version index atom
export const currentVersionIndexAtom = atom<number>(-1);

// Favorites atom with localStorage persistence
export const favoriteVersionsAtom = atomWithStorage<FavoriteVersion[]>(
  "wordmark-favorites",
  [],
);

// Helper atom to get the current version
export const currentVersionAtom = atom((get) => {
  const history = get(versionHistoryAtom);
  const index = get(currentVersionIndexAtom);

  if (index >= 0 && index < history.length) {
    return history[index];
  }

  return null;
});

// Selector atom to get all app state at once
export const allStateAtom = atom((get) => {
  return {
    card: get(cardAtom),
    text: get(textAtom),
    font: get(fontAtom),
    icon: get(iconAtom),
    layout: get(layoutAtom),
  };
});

// Add a version to history
export const addVersionAtom = atom(null, (get, set, thumbnail?: string) => {
  const history = get(versionHistoryAtom);
  const allState = get(allStateAtom);

  // Create a new version
  const newVersion: DesignVersion = {
    id: history.length > 0 ? history[history.length - 1].id + 1 : 1,
    timestamp: Date.now(),
    ...allState,
    thumbnail,
  };

  // Limit history size by removing oldest versions if needed
  const updatedHistory =
    history.length >= MAX_HISTORY_SIZE
      ? [...history.slice(-(MAX_HISTORY_SIZE - 1)), newVersion]
      : [...history, newVersion];

  set(versionHistoryAtom, updatedHistory);
  set(currentVersionIndexAtom, updatedHistory.length - 1);
});

// Add current version to favorites
export const addToFavoritesAtom = atom(null, (get, set, name?: string) => {
  const currentVersion = get(currentVersionAtom);
  if (!currentVersion) return;

  const favorites = get(favoriteVersionsAtom);

  // Create a unique ID for the favorite
  const favoriteId = `fav-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Add to favorites with optional name
  const newFavorite: FavoriteVersion = {
    ...currentVersion,
    favoriteId,
    name: name || `Favorite #${favorites.length + 1}`,
  };

  set(favoriteVersionsAtom, [...favorites, newFavorite]);
});

// Remove a version from favorites
export const removeFromFavoritesAtom = atom(
  null,
  (get, set, favoriteId: string) => {
    const favorites = get(favoriteVersionsAtom);
    set(
      favoriteVersionsAtom,
      favorites.filter((fav) => fav.favoriteId !== favoriteId),
    );
  },
);

// Check if the current version is in favorites
export const isCurrentVersionFavoritedAtom = atom((get) => {
  const currentVersion = get(currentVersionAtom);
  if (!currentVersion) return false;

  const favorites = get(favoriteVersionsAtom);

  // Compare based on deep equality of relevant properties (not using ID since favorites may be from different sessions)
  return favorites.some(
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
});

// Restore a specific version
export const restoreVersionAtom = atom(
  null,
  (get, set, versionIndex: number) => {
    const history = get(versionHistoryAtom);

    if (versionIndex >= 0 && versionIndex < history.length) {
      const version = history[versionIndex];

      // Restore all state atoms
      set(cardAtom, version.card);
      set(textAtom, version.text);
      if (version.font) set(fontAtom, version.font);
      set(iconAtom, version.icon);
      set(layoutAtom, version.layout);

      // Update current version index
      set(currentVersionIndexAtom, versionIndex);
    }
  },
);

// Restore a favorite version
export const restoreFavoriteAtom = atom(
  null,
  (get, set, favorite: FavoriteVersion) => {
    // Restore all state atoms
    set(cardAtom, favorite.card);
    set(textAtom, favorite.text);
    if (favorite.font) set(fontAtom, favorite.font);
    set(iconAtom, favorite.icon);
    set(layoutAtom, favorite.layout);

    // Create a new version in history based on this favorite
    set(addVersionAtom, favorite.thumbnail);
  },
);

// Helper to create a thumbnail of the current design
export const createThumbnail = async (): Promise<string | undefined> => {
  if (typeof window === "undefined") return undefined;

  try {
    // Find the main DisplayCard element
    const displayCard = document.querySelector(".display-card") as HTMLElement;

    if (!displayCard) return undefined;

    // Generate a small thumbnail from the display card
    const canvas = await html2canvas(displayCard, {
      scale: 0.2, // Scale down for thumbnail
      backgroundColor: null, // Transparent background
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Convert to base64 image data URL
    return canvas.toDataURL("image/png", 0.5);
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return undefined;
  }
};
