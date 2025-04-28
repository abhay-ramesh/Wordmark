import { Layouts } from "@/components/custom/SelectableLayoutCard";
import { LucideIconType } from "@/components/icons";
import html2canvas from "html2canvas";
import { atom } from "jotai";
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

// Maximum number of versions to keep in history
const MAX_HISTORY_SIZE = 30;

// Main history atom
export const versionHistoryAtom = atom<DesignVersion[]>([]);

// Current version index atom
export const currentVersionIndexAtom = atom<number>(-1);

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
