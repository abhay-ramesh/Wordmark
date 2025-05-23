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

// Fontsource API endpoint
const API_ENDPOINT = "https://api.fontsource.org/v1/fonts";

// Cache for API responses to avoid redundant requests
const responseCache = {
  apiData: null as any[] | null,
  processedFonts: null as FontsourceItem[] | null,
};

// Track loading state to avoid duplicate requests
let isLoadingFonts = false;

/**
 * Function to fetch font data from the Fontsource API with caching
 */
export const fetchFontsourceFonts = async (): Promise<FontsourceItem[]> => {
  // Return from cache if available
  if (responseCache.processedFonts) {
    return responseCache.processedFonts;
  }

  // Prevent multiple concurrent requests
  if (isLoadingFonts) {
    // Return sample fonts while loading
    return fontsourceList;
  }

  isLoadingFonts = true;

  try {
    // Use cached API data if available
    let data: any[];
    if (responseCache.apiData) {
      data = responseCache.apiData;
    } else {
      console.log("Fetching fonts from FontSource API...");
      const response = await fetch(API_ENDPOINT, {
        headers: {
          Accept: "application/json",
        },
        // Add cache control for better performance
        cache: "force-cache",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch from API: ${response.status}`);
      }

      data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid API response format");
      }

      // Store in cache
      responseCache.apiData = data;

      // Debug: Check if any fonts have variants
      const fontsWithVariants = data.filter((font) => font.variants);
      console.log(
        `Found ${fontsWithVariants.length} out of ${data.length} fonts with variants property`,
      );

      if (fontsWithVariants.length > 0) {
        // Log example variant structure
        const sampleFont = fontsWithVariants[0];
        console.log(
          `Sample font variant structure for ${sampleFont.family}:`,
          JSON.stringify(sampleFont.variants, null, 2).substring(0, 300) +
            "...",
        );
      }
    }

    console.log(`Processing ${data.length} fonts from Fontsource API`);

    // Process fonts in batches to avoid blocking the main thread
    const processedFonts = await processFontsInBatches(data);

    // Store processed fonts in cache
    responseCache.processedFonts = processedFonts;

    // Debug: Check if any processed fonts have direct URLs
    const fontsWithDirectUrls = processedFonts.filter(
      (font) =>
        font.files.regular && font.files.regular.includes("cdn.jsdelivr.net"),
    );
    console.log(
      `Found ${fontsWithDirectUrls.length} out of ${processedFonts.length} processed fonts with direct URLs`,
    );

    if (fontsWithDirectUrls.length > 0) {
      console.log(`Sample direct URL: ${fontsWithDirectUrls[0].files.regular}`);
    }

    return processedFonts;
  } catch (error) {
    console.error("Failed to fetch Fontsource fonts:", error);
    return [];
  } finally {
    isLoadingFonts = false;
  }
};

/**
 * Process fonts in batches to avoid UI freezing
 */
const processFontsInBatches = async (
  data: any[],
): Promise<FontsourceItem[]> => {
  const BATCH_SIZE = 200;
  const results: FontsourceItem[] = [];

  const processBatch = (
    startIndex: number,
    endIndex: number,
  ): FontsourceItem[] => {
    const batch = data.slice(startIndex, endIndex);
    return batch.map((font: FontsourceApiItem) => createFontItem(font));
  };

  // Process fonts in batches
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const endIndex = Math.min(i + BATCH_SIZE, data.length);
    // Process batch and wait before processing the next one
    const batchResults = processBatch(i, endIndex);
    results.push(...batchResults);

    // Yield to browser if in browser environment to avoid UI freezing
    if (typeof window !== "undefined" && i + BATCH_SIZE < data.length) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return results;
};

/**
 * Create a FontsourceItem from API data
 */
const createFontItem = (font: FontsourceApiItem): FontsourceItem => {
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
    license: font.license || "OFL",
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

// Set of loaded fonts to avoid duplicates
const loadedFontsSet = new Set<string>();

// Load Fontsource fonts
export const loadFontsourceFonts = () => {
  if (typeof window === "undefined") return null;

  // Load fonts in a non-blocking way
  setTimeout(() => {
    // Loop through fontsource fonts and load them
    fontsourceList.forEach((font) => {
      // Skip if already loaded
      if (loadedFontsSet.has(font.family)) return;

      // Use preconnect to improve loading performance
      if (
        !document.querySelector(
          `link[rel="preconnect"][href="https://fonts.googleapis.com"]`,
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

        // Add preconnect for fontsource CDN
        const preconnect3 = document.createElement("link");
        preconnect3.rel = "preconnect";
        preconnect3.href = "https://cdn.jsdelivr.net";
        preconnect3.crossOrigin = "anonymous";
        document.head.appendChild(preconnect3);
      }

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
                console.error(`Failed to load font: ${font.family} bold`, err);
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
      loadedFontsSet.add(font.family);
    });
  }, 0);

  return null;
};

// Get a subset of fonts (for better performance with large lists)
export const getFontsourceSubset = (
  start = 0,
  count = 999999,
): FontsourceItem[] => {
  // Return the full list if it's small enough
  if (fontsourceList.length <= count) {
    return fontsourceList;
  }

  return fontsourceList.slice(start, start + count);
};

// Populate the font list from the API if we're in a browser environment
if (typeof window !== "undefined") {
  // Fetch in a non-blocking way after a small delay
  setTimeout(() => {
    fetchFontsourceFonts()
      .then((fonts) => {
        if (fonts.length > 0) {
          fontsourceList = fonts;
          console.log(`Loaded ${fonts.length} Fontsource fonts`);

          // Clear the font cache to ensure the UI updates with the new fonts
          clearFontCache("all");
          clearFontCache("provider_fontSource");
          clearFontCache("fontSource_0_999999");

          // Emit event for components to update
          emitFontProviderEvent("fontSourceUpdated", { count: fonts.length });
        }
      })
      .catch((error) => {
        console.error("Error loading Fontsource fonts:", error);
      });
  }, 300); // Small delay to prioritize critical resources first
}
