import {
  allStateAtom,
  DesignVersion,
  FavoriteVersion,
  favoriteVersionsAtom,
  versionHistoryAtom,
} from "@/lib/versionHistory";
import { getDefaultStore } from "jotai";

export type ExportDataType = {
  version: string;
  exportDate: string;
  type: "all" | "favorites" | "history" | "current";
  data: {
    favorites?: FavoriteVersion[];
    history?: DesignVersion[];
    current?: DesignVersion;
  };
};

/**
 * Export all data (favorites and history) as a JSON file
 */
export const exportAllData = (): void => {
  const store = getDefaultStore();
  const favorites = store.get(favoriteVersionsAtom);
  const history = store.get(versionHistoryAtom);

  const exportData: ExportDataType = {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    type: "all",
    data: {
      favorites,
      history,
    },
  };

  downloadJSON(exportData, "wordmark-all-data");
};

/**
 * Export only favorites as a JSON file
 */
export const exportFavorites = (): void => {
  const store = getDefaultStore();
  const favorites = store.get(favoriteVersionsAtom);

  const exportData: ExportDataType = {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    type: "favorites",
    data: {
      favorites,
    },
  };

  downloadJSON(exportData, "wordmark-favorites");
};

/**
 * Export history as a JSON file
 */
export const exportHistory = (): void => {
  const store = getDefaultStore();
  const history = store.get(versionHistoryAtom);

  const exportData: ExportDataType = {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    type: "history",
    data: {
      history,
    },
  };

  downloadJSON(exportData, "wordmark-history");
};

/**
 * Export the current design as a JSON file
 */
export const exportCurrentDesign = (): void => {
  const store = getDefaultStore();
  const allState = store.get(allStateAtom);

  // Convert current state to a DesignVersion format
  const currentDesign: DesignVersion = {
    id: Date.now(),
    timestamp: Date.now(),
    card: allState.card,
    text: allState.text,
    font: allState.font,
    icon: allState.icon,
    layout: allState.layout,
  };

  const exportData: ExportDataType = {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    type: "current",
    data: {
      current: currentDesign,
    },
  };

  downloadJSON(exportData, "wordmark-current-design");
};

/**
 * Export selected favorites as a JSON file
 */
export const exportSelectedFavorites = (favoriteIds: string[]): void => {
  const store = getDefaultStore();
  const favorites = store.get(favoriteVersionsAtom);
  const selectedFavorites = favorites.filter((fav) =>
    favoriteIds.includes(fav.favoriteId),
  );

  const exportData: ExportDataType = {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    type: "favorites",
    data: {
      favorites: selectedFavorites,
    },
  };

  downloadJSON(exportData, "wordmark-selected-favorites");
};

/**
 * Helper function to download data as a JSON file
 */
function downloadJSON(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
