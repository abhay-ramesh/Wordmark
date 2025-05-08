import { FontItem } from "@/lib/fonts";
import { emitFontProviderEvent } from "./events";
import { clearFontCache } from "./index";

/**
 * Open Foundry font provider
 * API endpoint: /api/fonts/openFoundry
 *
 * Uses a proxy API to avoid CORS issues with direct font loading
 */

// Define the structure of an Open Foundry API item
export interface OpenFoundryApiItem {
  "font-id": string;
  "font-name": string;
  "font-style": string;
  "font-creator": string;
  "font-download-link": string;
  "info-weight": number;
  "info-style": string;
  "info-classification": string;
  "info-license": string;
  "info-about"?: string;
  "info-family"?: string;
}

// Extended files interface to handle Open Foundry fonts
interface OpenFoundryFiles {
  regular: string; // URL to the regular font file
  italic?: string; // URL to the italic font file
  bold?: string; // URL to the bold font file
  boldItalic?: string; // URL to the bold italic font file
}

// Define the Open Foundry item that extends FontItem
export interface OpenFoundryItem extends Omit<FontItem, "files"> {
  provider: "openFoundry";
  files: OpenFoundryFiles;
  sourceId: string; // Original ID from the API data
  license: string; // Font license
  classification: string; // Font classification (serif, sans-serif, etc.)
  creator?: string; // Font creator
  about?: string; // Description about the font
}

// Our backend API endpoint for Open Foundry fonts
const API_ENDPOINT = "/api/fonts/openFoundry";

// Cache for API responses to avoid redundant requests
const responseCache = {
  processedFonts: null as OpenFoundryItem[] | null,
};

// Track loading state to avoid duplicate requests
let isLoadingFonts = false;

/**
 * Function to fetch font data from our Open Foundry API with caching
 */
export const fetchOpenFoundryFonts = async (): Promise<OpenFoundryItem[]> => {
  // Return from cache if available
  if (responseCache.processedFonts) {
    return responseCache.processedFonts;
  }

  // Prevent multiple concurrent requests
  if (isLoadingFonts) {
    // Return sample fonts while loading
    return openFoundryList;
  }

  isLoadingFonts = true;

  try {
    console.log("Fetching fonts from Open Foundry API...");
    const response = await fetch(API_ENDPOINT, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from API: ${response.status}`);
    }

    const responseData = await response.json();

    if (!responseData.success || !Array.isArray(responseData.fonts)) {
      throw new Error("Invalid API response format");
    }

    const fonts = responseData.fonts as OpenFoundryItem[];
    console.log(`Received ${fonts.length} fonts from Open Foundry API`);

    // Store in cache
    responseCache.processedFonts = fonts;

    return fonts;
  } catch (error) {
    console.error("Failed to fetch Open Foundry fonts:", error);
    return [];
  } finally {
    isLoadingFonts = false;
  }
};

// Initial font list (will be populated by API call)
export let openFoundryList: OpenFoundryItem[] = [
  // Sample font to show while API loads
  {
    family: "Aileron Black",
    variants: ["regular"],
    subsets: ["latin"],
    version: "v1",
    lastModified: "2023-11-01",
    files: {
      regular: "/api/fonts/openFoundry/Aileron-Black.otf",
    },
    category: "sans-serif",
    kind: "webfont",
    menu: "",
    provider: "openFoundry",
    sourceId: "aileron-black",
    license: "SIL Open Font License 1.1",
    classification: "Sans Serif",
  },
];

// Set of loaded fonts to avoid duplicates
const loadedFontsSet = new Set<string>();

// Load Open Foundry fonts
export const loadOpenFoundryFonts = () => {
  if (typeof window === "undefined") return null;

  // Load fonts in a non-blocking way
  setTimeout(() => {
    // Loop through Open Foundry fonts and load them
    openFoundryList.forEach((font) => {
      // Skip if already loaded
      if (loadedFontsSet.has(font.family)) return;

      try {
        // Each font from our API already has the correct proxy URL to the font file
        if (font.files.regular) {
          // Use the FontFace API to load the font
          const fontFace = new FontFace(
            font.family,
            `url(${font.files.regular})`,
            {
              weight: font.variants.includes("bold") ? "700" : "400",
              style: font.variants.includes("italic") ? "italic" : "normal",
            },
          );

          fontFace
            .load()
            .then((loadedFace) => {
              document.fonts.add(loadedFace);
              console.log(`Loaded font directly: ${font.family}`);
            })
            .catch((err) => {
              console.error(`Failed to load font: ${font.family}`, err);
            });
        }
      } catch (err) {
        console.error(`Error loading font ${font.family}`, err);
      }

      // Mark as loaded
      loadedFontsSet.add(font.family);
    });
  }, 0);

  return null;
};

// Get a subset of fonts (for better performance with large lists)
export const getOpenFoundrySubset = (
  start = 0,
  count = 999999,
): OpenFoundryItem[] => {
  // Return the full list if it's small enough
  if (openFoundryList.length <= count) {
    return openFoundryList;
  }

  return openFoundryList.slice(start, start + count);
};

// Populate the font list from the API if we're in a browser environment
if (typeof window !== "undefined") {
  // Fetch in a non-blocking way after a small delay
  setTimeout(() => {
    fetchOpenFoundryFonts()
      .then((fonts) => {
        if (fonts.length > 0) {
          openFoundryList = fonts;
          console.log(`Loaded ${fonts.length} Open Foundry fonts`);

          // Debug log some sample fonts
          console.log("Open Foundry Fonts Sample:");
          fonts.slice(0, 3).forEach((font) => {
            console.log(`- ${font.family} (${font.sourceId})`);
            console.log(`  Font URL: ${font.files.regular}`);
            console.log(`  Variants: ${font.variants.join(", ")}`);
          });

          // Clear the font cache to ensure the UI updates with the new fonts
          clearFontCache("all");
          clearFontCache("provider_openFoundry");
          clearFontCache("openFoundry_0_999999");

          // Emit events for components to update
          emitFontProviderEvent("fontProviderUpdated", {
            provider: "openFoundry",
            count: fonts.length,
          });
          emitFontProviderEvent("openFoundryUpdated", {
            count: fonts.length,
          });
        }
      })
      .catch((error) => {
        console.error("Error loading Open Foundry fonts:", error);
      });
  }, 300); // Small delay to prioritize critical resources first
}
