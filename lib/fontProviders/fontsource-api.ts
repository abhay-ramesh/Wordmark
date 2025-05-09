import { FontItem } from "@/lib/fonts";
import { emitFontProviderEvent } from "./events";
import { clearFontCache } from "./index";

/**
 * Fontsource API integration
 * API endpoint: https://api.fontsource.org/v1/fonts
 */

// Define the structure of a Fontsource API item
export interface FontsourceApiItem {
  id: string;
  family: string;
  subsets: string[];
  weights: number[];
  styles: string[];
  defSubset: string;
  variable: boolean;
  lastModified: string;
  category: string;
  version: string;
  license: string;
  type: string;
}

// Extended files interface to handle Fontsource fonts
interface FontsourceFiles {
  regular: string; // URL to the regular font file
  italic?: string; // URL to the italic font file
  bold?: string; // URL to the bold font file
  boldItalic?: string; // URL to the bold italic font file
}

// Define the Fontsource item that extends FontItem
export interface FontsourceItem extends Omit<FontItem, "files"> {
  provider: "fontsource";
  files: FontsourceFiles;
  sourceId: string; // Original ID from the API data
  license: string; // Font license
  type: string; // Font type (google, etc.)
  cssUrl?: string; // URL to the CSS file
}

// Interface for export to work with types
export interface Font {
  family: string;
  id: string;
  category: string;
  subsets: string[];
  variants: {
    weight: string;
    style: string;
  }[];
  provider: string;
  files: Record<string, string>;
}

// Fontsource API endpoint
const API_ENDPOINT = "https://api.fontsource.org/v1/fonts";

// Cache for API responses to avoid redundant requests
const apiCache = {
  allFonts: null as FontsourceAPIFont[] | null,
  processedFonts: null as FontsourceItem[] | null,
  subsets: {} as Record<string, FontsourceItem[]>, // Cache for font subsets
};

// Track loading state to avoid duplicate requests
let isLoadingFonts = false;
let currentOffset = 0;
let hasMoreFonts = true;

// Define the structure of a Fontsource API font
export interface FontsourceAPIFont {
  family: string;
  id: string;
  subsets: string[];
  weights: number[];
  styles: string[];
  unicodeRange?: string;
  defSubset: string;
  variable?: boolean;
  lastModified: string;
  category: string;
  version: string;
  type: string;
  variants?: {
    [weight: string]: {
      [style: string]: {
        [subset: string]: {
          url: {
            woff2: string;
            woff: string;
            ttf: string;
          };
        };
      };
    };
  };
}

/**
 * Function to fetch font data from the Fontsource API
 */
export const fetchFontsourceFonts = async (
  limit = 200,
  offset = 0,
): Promise<FontsourceItem[]> => {
  // Return from cache if available and not requesting more
  if (apiCache.processedFonts && offset === 0) {
    return apiCache.processedFonts;
  }

  // Prevent multiple concurrent requests for the same data
  if (isLoadingFonts && offset === currentOffset) {
    // Return what we have so far while loading
    return fontsourceList;
  }

  isLoadingFonts = true;
  currentOffset = offset;

  try {
    // Fetch raw API data if not cached
    let apiData: FontsourceAPIFont[];
    if (!apiCache.allFonts) {
      console.log("Fetching all fonts from Fontsource API");

      const response = await fetch(API_ENDPOINT, {
        headers: {
          Accept: "application/json",
        },
        // Use cache for better performance
        cache: "force-cache",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch from API: ${response.status}`);
      }

      const data: FontsourceAPIFont[] = await response.json();
      apiCache.allFonts = data;
      apiData = data;

      console.log(`Fetched ${data.length} fonts from Fontsource API`);
    } else {
      apiData = apiCache.allFonts;
    }

    // Get the batch of fonts to process
    const endIndex = Math.min(offset + limit, apiData.length);
    const currentBatch = apiData.slice(offset, endIndex);
    console.log(
      `Processing Fontsource API fonts batch: ${offset} to ${endIndex - 1}`,
    );

    // Process the current batch
    const newFonts = await processFontBatch(currentBatch);

    // For initial load, replace the list
    if (offset === 0) {
      const processedFonts = newFonts;
      apiCache.processedFonts = processedFonts;
      fontsourceList = processedFonts;
    } else {
      // For subsequent loads, append to the list
      fontsourceList = [...fontsourceList, ...newFonts];
      // Update the cache too
      if (apiCache.processedFonts) {
        apiCache.processedFonts = [...apiCache.processedFonts, ...newFonts];
      } else {
        apiCache.processedFonts = newFonts;
      }
    }

    // Update if there are more fonts to load
    hasMoreFonts = endIndex < apiData.length;

    return fontsourceList;
  } catch (error) {
    console.error("Failed to fetch Fontsource fonts:", error);
    return fontsourceList; // Return what we have
  } finally {
    isLoadingFonts = false;
  }
};

/**
 * Process a batch of fonts in smaller chunks to avoid UI blocking
 */
const processFontBatch = async (
  fonts: FontsourceAPIFont[],
): Promise<FontsourceItem[]> => {
  const CHUNK_SIZE = 30;
  const result: FontsourceItem[] = [];

  for (let i = 0; i < fonts.length; i += CHUNK_SIZE) {
    const chunk = fonts.slice(i, i + CHUNK_SIZE);
    const processedChunk = chunk.map((font) => convertApiItemToFontItem(font));
    result.push(...processedChunk);

    // Yield to browser to avoid UI blocking if processing large batches
    if (typeof window !== "undefined" && i + CHUNK_SIZE < fonts.length) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return result;
};

/**
 * Convert API item to FontsourceItem
 */
const convertApiItemToFontItem = (font: FontsourceAPIFont): FontsourceItem => {
  // Determine available variants
  const hasItalic = font.styles?.includes("italic");
  const hasRegular = font.styles?.includes("normal");
  const hasBold = font.weights?.includes(700) || font.weights?.includes(600);
  const hasBoldItalic = hasBold && hasItalic;

  // Create the variants array
  const variants: string[] = [];
  if (hasRegular) variants.push("regular");
  if (hasItalic) variants.push("italic");
  if (hasBold) variants.push("bold");
  if (hasBoldItalic) variants.push("bold-italic");

  // Default weight (prefer 400, otherwise use the first available weight)
  const defaultWeight = font.weights?.includes(400)
    ? 400
    : font.weights && font.weights.length > 0
    ? font.weights[0]
    : 400;

  // Files for different variants
  const files: FontsourceFiles = {
    regular: "", // Will be populated if font.variants is available
  };

  // Check if font has variants with direct URLs
  if (font.variants) {
    // Regular variant (weight 400, style normal)
    if (font.variants["400"] && font.variants["400"].normal) {
      const subset = font.defSubset || "latin";
      if (font.variants["400"].normal[subset]?.url?.woff2) {
        files.regular = font.variants["400"].normal[subset].url.woff2;
      }
    }

    // Italic variant (weight 400, style italic)
    if (hasItalic && font.variants["400"] && font.variants["400"].italic) {
      const subset = font.defSubset || "latin";
      if (font.variants["400"].italic[subset]?.url?.woff2) {
        files.italic = font.variants["400"].italic[subset].url.woff2;
      }
    }

    // Bold variant (weight 700, style normal)
    const boldWeight = font.weights?.includes(700)
      ? "700"
      : font.weights?.includes(600)
      ? "600"
      : "400";
    if (
      hasBold &&
      font.variants[boldWeight] &&
      font.variants[boldWeight].normal
    ) {
      const subset = font.defSubset || "latin";
      if (font.variants[boldWeight].normal[subset]?.url?.woff2) {
        files.bold = font.variants[boldWeight].normal[subset].url.woff2;
      }
    }

    // Bold-italic variant (weight 700, style italic)
    if (
      hasBoldItalic &&
      font.variants[boldWeight] &&
      font.variants[boldWeight].italic
    ) {
      const subset = font.defSubset || "latin";
      if (font.variants[boldWeight].italic[subset]?.url?.woff2) {
        files.boldItalic = font.variants[boldWeight].italic[subset].url.woff2;
      }
    }
  }

  // Fallback to Google Fonts if no direct URLs found
  if (!files.regular) {
    const cssBaseUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      font.family,
    )}`;
    files.regular = `${cssBaseUrl}&display=swap`;

    if (hasItalic) {
      files.italic = `${cssBaseUrl}:ital@1&display=swap`;
    }

    if (hasBold) {
      const boldWeightNum = font.weights?.includes(700)
        ? 700
        : font.weights?.includes(600)
        ? 600
        : defaultWeight;
      files.bold = `${cssBaseUrl}:wght@${boldWeightNum}&display=swap`;
    }

    if (hasBoldItalic) {
      const boldWeightNum = font.weights?.includes(700)
        ? 700
        : font.weights?.includes(600)
        ? 600
        : defaultWeight;
      files.boldItalic = `${cssBaseUrl}:ital,wght@1,${boldWeightNum}&display=swap`;
    }
  }

  return {
    family: font.family,
    variants,
    subsets: font.subsets || ["latin"],
    version: font.version || `v${font.lastModified?.split("-")[0] || "1"}`,
    lastModified: font.lastModified || new Date().toISOString().split("T")[0],
    files,
    category: font.category || "sans-serif",
    kind: "webfont",
    menu: "",
    provider: "fontsource",
    sourceId: font.id,
    license: "OFL", // Default license
    type: font.type || "google",
    cssUrl: files.regular,
  };
};

// Initial font list (will be populated by API call)
export let fontsourceList: FontsourceItem[] = [
  // Sample fonts to show while API loads
  {
    family: "Roboto",
    variants: ["regular", "italic", "bold", "bold-italic"],
    subsets: ["latin"],
    version: "v1",
    lastModified: "2023-11-01",
    files: {
      regular: "https://fonts.googleapis.com/css2?family=Roboto&display=swap",
    },
    category: "sans-serif",
    kind: "webfont",
    menu: "",
    provider: "fontsource",
    sourceId: "roboto",
    license: "OFL",
    type: "google",
  },
  {
    family: "Open Sans",
    variants: ["regular", "italic", "bold", "bold-italic"],
    subsets: ["latin"],
    version: "v1",
    lastModified: "2023-11-01",
    files: {
      regular:
        "https://fonts.googleapis.com/css2?family=Open+Sans&display=swap",
    },
    category: "sans-serif",
    kind: "webfont",
    menu: "",
    provider: "fontsource",
    sourceId: "open-sans",
    license: "OFL",
    type: "google",
  },
];

// Set of already loaded font families to avoid duplicates
const loadedFonts = new Set<string>();

// Load Fontsource fonts efficiently
export const loadFontsourceFonts = () => {
  if (typeof window === "undefined") return null;

  // Use requestIdleCallback or setTimeout to load fonts during browser idle time
  const loadFonts = () => {
    // Add preconnect for Google Fonts (only once)
    if (
      !document.querySelector(
        'link[rel="preconnect"][href="https://fonts.googleapis.com"]',
      )
    ) {
      const preconnect1 = document.createElement("link");
      preconnect1.rel = "preconnect";
      preconnect1.href = "https://fonts.googleapis.com";
      document.head.appendChild(preconnect1);

      const preconnect2 = document.createElement("link");
      preconnect2.rel = "preconnect";
      preconnect2.href = "https://fonts.gstatic.com";
      preconnect2.crossOrigin = "anonymous";
      document.head.appendChild(preconnect2);

      // Add preconnect for Fontsource CDN
      const preconnect3 = document.createElement("link");
      preconnect3.rel = "preconnect";
      preconnect3.href = "https://cdn.jsdelivr.net";
      preconnect3.crossOrigin = "anonymous";
      document.head.appendChild(preconnect3);
    }

    // Loop through fontsource fonts and load them in batches
    const BATCH_SIZE = 5;
    const loadBatch = (startIndex: number) => {
      const endIndex = Math.min(startIndex + BATCH_SIZE, fontsourceList.length);
      const batch = fontsourceList.slice(startIndex, endIndex);

      batch.forEach((font) => {
        // Skip if already loaded
        if (loadedFonts.has(font.family)) return;

        // Check if the font URL is a direct font file URL or a CSS URL
        const isDirectFontUrl =
          font.cssUrl?.includes("cdn.jsdelivr.net") ||
          font.files.regular?.includes("cdn.jsdelivr.net");

        if (isDirectFontUrl) {
          // Load using FontFace API for direct font URLs
          try {
            // Regular style
            if (font.files.regular) {
              const fontFace = new FontFace(
                font.family,
                `url(${font.files.regular})`,
                { weight: "400", style: "normal" },
              );
              fontFace
                .load()
                .then((loadedFace) => {
                  document.fonts.add(loadedFace);
                })
                .catch((err) => {
                  console.error(
                    `Failed to load font: ${font.family} regular`,
                    err,
                  );
                });
            }

            // Italic style
            if (font.files.italic) {
              const fontFace = new FontFace(
                font.family,
                `url(${font.files.italic})`,
                { weight: "400", style: "italic" },
              );
              fontFace
                .load()
                .then((loadedFace) => {
                  document.fonts.add(loadedFace);
                })
                .catch((err) => {
                  console.error(
                    `Failed to load font: ${font.family} italic`,
                    err,
                  );
                });
            }

            // Bold style
            if (font.files.bold) {
              const fontFace = new FontFace(
                font.family,
                `url(${font.files.bold})`,
                { weight: "700", style: "normal" },
              );
              fontFace
                .load()
                .then((loadedFace) => {
                  document.fonts.add(loadedFace);
                })
                .catch((err) => {
                  console.error(
                    `Failed to load font: ${font.family} bold`,
                    err,
                  );
                });
            }

            // Bold-italic style
            if (font.files.boldItalic) {
              const fontFace = new FontFace(
                font.family,
                `url(${font.files.boldItalic})`,
                { weight: "700", style: "italic" },
              );
              fontFace
                .load()
                .then((loadedFace) => {
                  document.fonts.add(loadedFace);
                })
                .catch((err) => {
                  console.error(
                    `Failed to load font: ${font.family} bold-italic`,
                    err,
                  );
                });
            }
          } catch (err) {
            console.error(
              `Error loading font ${font.family} with FontFace API, falling back to CSS`,
              err,
            );
            // Fall back to CSS link method
            const link = document.createElement("link");
            link.href = font.cssUrl || font.files.regular;
            link.rel = "stylesheet";
            document.head.appendChild(link);
          }
        } else {
          // Use CSS link method for Google Fonts URLs
          const link = document.createElement("link");
          link.href = font.cssUrl || font.files.regular;
          link.rel = "stylesheet";
          document.head.appendChild(link);
        }

        // Mark as loaded
        loadedFonts.add(font.family);
      });

      // Load next batch if there are more fonts
      if (endIndex < fontsourceList.length) {
        setTimeout(() => loadBatch(endIndex), 100);
      }
    };

    // Start loading the first batch
    loadBatch(0);
  };

  // Use requestIdleCallback if available, otherwise use setTimeout
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(loadFonts);
  } else {
    setTimeout(loadFonts, 100);
  }

  return null;
};

/**
 * Load more fonts incrementally
 * Returns the number of new fonts loaded
 */
export const loadMoreFontsourceFonts = async (): Promise<number> => {
  if (isLoadingFonts || !hasMoreFonts) {
    return 0;
  }

  const prevCount = fontsourceList.length;
  const BATCH_SIZE = 200;

  try {
    console.log(
      `Loading more fonts from offset ${currentOffset}, batch size ${BATCH_SIZE}`,
    );
    await fetchFontsourceFonts(BATCH_SIZE, currentOffset);

    const newFontsCount = fontsourceList.length - prevCount;
    console.log(`Loaded ${newFontsCount} additional fonts`);

    return newFontsCount;
  } catch (error) {
    console.error("Error loading additional fonts:", error);
    return 0;
  }
};

// Get a subset of fonts (for better performance with large lists)
export const getFontsourceSubset = (
  start = 0,
  count = 999999,
): FontsourceItem[] => {
  // Check cache first
  const cacheKey = `${start}_${count}`;
  if (apiCache.subsets[cacheKey]) {
    return apiCache.subsets[cacheKey];
  }

  const subset = fontsourceList.slice(start, start + count);

  // Cache the result
  apiCache.subsets[cacheKey] = subset;

  return subset;
};

// Populate the font list from the API if we're in a browser environment
if (typeof window !== "undefined") {
  // Use setTimeout to delay the API call until after critical resources are loaded
  setTimeout(() => {
    fetchFontsourceFonts()
      .then((fonts) => {
        if (fonts.length > 0) {
          console.log(`Loaded ${fonts.length} Fontsource API fonts`);

          // Clear the font cache to ensure the UI updates with the new fonts
          clearFontCache("all");
          clearFontCache("provider_fontSource");
          clearFontCache("fontSource_0_999999");

          // Emit event for components to update
          emitFontProviderEvent("fontProviderUpdated", {
            provider: "fontSource",
            count: fonts.length,
          });
        }
      })
      .catch((error) => {
        console.error("Error loading Fontsource API fonts:", error);
      });
  }, 500);
}

export async function fetchFontsourceAPIFonts(): Promise<Font[]> {
  // Use cached data if available
  if (apiCache.allFonts) {
    return apiCache.allFonts.map(convertToStandardFont);
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      headers: {
        Accept: "application/json",
      },
      cache: "force-cache",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch fonts: ${response.status}`);
    }

    const data: FontsourceAPIFont[] = await response.json();

    // Cache the result
    apiCache.allFonts = data;

    return data.map(convertToStandardFont);
  } catch (error) {
    console.error("Error fetching Fontsource API fonts:", error);
    return [];
  }
}

// Helper function to convert FontsourceAPIFont to Font
function convertToStandardFont(font: FontsourceAPIFont): Font {
  return {
    family: font.family,
    id: font.id,
    category: font.category || "sans-serif",
    variants: font.weights.map((weight) => ({
      weight: weight.toString(),
      style: "normal",
    })),
    subsets: font.subsets,
    provider: "fontsource",
    files: {},
  };
}
