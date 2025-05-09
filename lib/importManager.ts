import { atom, getDefaultStore } from "jotai";
import { ExportDataType } from "./exportManager";
import { favoriteVersionsAtom, versionHistoryAtom } from "./versionHistory";

// Atom for import status notifications
export const importStatusAtom = atom<{
  isImporting: boolean;
  success: boolean | null;
  message: string;
}>({
  isImporting: false,
  success: null,
  message: "",
});

/**
 * Validates imported data structure
 */
function validateImportData(data: any): { valid: boolean; message: string } {
  try {
    // Check if it's a valid JSON object
    if (!data || typeof data !== "object") {
      return { valid: false, message: "Invalid data format" };
    }

    // Check for required fields
    if (!data.version || !data.exportDate || !data.type || !data.data) {
      return {
        valid: false,
        message: "Missing required fields in imported data",
      };
    }

    // Check data type validity
    if (!["all", "favorites", "history", "current"].includes(data.type)) {
      return { valid: false, message: "Invalid data type" };
    }

    // Validate specific data based on type
    switch (data.type) {
      case "all":
        if (!data.data.favorites || !data.data.history) {
          return { valid: false, message: "Missing favorites or history data" };
        }
        break;
      case "favorites":
        if (!data.data.favorites) {
          return { valid: false, message: "Missing favorites data" };
        }
        break;
      case "history":
        if (!data.data.history) {
          return { valid: false, message: "Missing history data" };
        }
        break;
      case "current":
        if (!data.data.current) {
          return { valid: false, message: "Missing current design data" };
        }
        break;
    }

    return { valid: true, message: "Valid data" };
  } catch (error) {
    return { valid: false, message: "Error validating import data" };
  }
}

/**
 * Import data from a JSON file
 * @param file The file to import
 * @param mode Import mode: "merge" or "replace"
 * @returns Promise that resolves when import is complete
 */
export const importFromFile = async (
  file: File,
  mode: "merge" | "replace" = "merge",
): Promise<boolean> => {
  const store = getDefaultStore();

  // Set import status to loading
  store.set(importStatusAtom, {
    isImporting: true,
    success: null,
    message: "Importing data...",
  });

  try {
    // Read the file
    const fileContent = await file.text();
    const importData = JSON.parse(fileContent) as ExportDataType;

    // Validate the data
    const validation = validateImportData(importData);
    if (!validation.valid) {
      store.set(importStatusAtom, {
        isImporting: false,
        success: false,
        message: validation.message,
      });
      return false;
    }

    // Process based on data type
    if (importData.data.favorites) {
      const currentFavorites =
        mode === "merge" ? store.get(favoriteVersionsAtom) : [];

      // For merge mode, create a map of existing IDs to avoid duplicates
      const existingIds = new Set(
        currentFavorites.map((fav) => fav.favoriteId),
      );

      // Filter out duplicates when merging, or take all for replace
      const newFavorites =
        mode === "merge"
          ? [
              ...currentFavorites,
              ...importData.data.favorites.filter(
                (fav) => !existingIds.has(fav.favoriteId),
              ),
            ]
          : importData.data.favorites;

      // Update the favorites atom
      store.set(favoriteVersionsAtom, newFavorites);
    }

    if (importData.data.history) {
      const currentHistory =
        mode === "merge" ? store.get(versionHistoryAtom) : [];

      // For merge mode, create a map of existing IDs to avoid duplicates
      const existingIds = new Set(currentHistory.map((ver) => ver.id));

      // Filter out duplicates when merging, or take all for replace
      const newHistory =
        mode === "merge"
          ? [
              ...currentHistory,
              ...importData.data.history.filter(
                (ver) => !existingIds.has(ver.id),
              ),
            ]
          : importData.data.history;

      // Update the history atom
      store.set(versionHistoryAtom, newHistory);
    }

    // Set success status
    store.set(importStatusAtom, {
      isImporting: false,
      success: true,
      message: `Successfully imported data in ${mode} mode`,
    });

    return true;
  } catch (error) {
    console.error("Import error:", error);

    // Set error status
    store.set(importStatusAtom, {
      isImporting: false,
      success: false,
      message: `Error importing data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });

    return false;
  }
};
