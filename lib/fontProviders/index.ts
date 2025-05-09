import { FontItem, fontList as googleFontList } from "@/lib/fonts";
import { adobeFontList, loadAdobeFonts } from "./adobe";
import { customFontList, loadCustomFonts } from "./custom";
import {
  fontsourceList as fontSourceList,
  getFontsourceSubset as getFontSourceSubset,
  loadFontsourceFonts as loadFontSourceFonts,
} from "./fontSource";
import {
  fontSquirrelList,
  loadFontSquirrelFonts,
  loadMoreFontSquirrelFonts,
} from "./fontSquirrel";
import {
  getOpenFoundrySubset,
  loadOpenFoundryFonts,
  openFoundryList,
} from "./openFoundry";

// Extend the base FontItem to include provider info
export interface ExtendedFontItem extends FontItem {
  provider?:
    | "google"
    | "adobe"
    | "fontSquirrel"
    | "custom"
    | "fontSource"
    | "fontsource"
    | "openFoundry";
}

// Cache for font lists to avoid recalculations
const fontListCache: {
  [key: string]: ExtendedFontItem[];
} = {};

// Optimization: Only transform once and cache
const getGoogleFontsWithProvider = (): ExtendedFontItem[] => {
  if (!fontListCache.google) {
    fontListCache.google = googleFontList.map((font) => ({
      ...font,
      provider: "google",
    }));
  }
  return fontListCache.google;
};

// Get a subset of fonts with caching - fontSource
const getFontSourceSubsetCached = (
  start = 0,
  count = 500,
): ExtendedFontItem[] => {
  const cacheKey = `fontSource_${start}_${count}`;
  if (!fontListCache[cacheKey]) {
    fontListCache[cacheKey] = getFontSourceSubset(start, count);
  }
  return fontListCache[cacheKey];
};

// Get a subset of fonts with caching - openFoundry
const getOpenFoundrySubsetCached = (
  start = 0,
  count = 500,
): ExtendedFontItem[] => {
  const cacheKey = `openFoundry_${start}_${count}`;
  if (!fontListCache[cacheKey]) {
    fontListCache[cacheKey] = getOpenFoundrySubset(start, count);
  }
  return fontListCache[cacheKey];
};

// Lazily combine all font lists only when needed
export const getAllFontList = (): ExtendedFontItem[] => {
  if (!fontListCache.all) {
    // Get all fonts from each provider
    const googleFonts = getGoogleFontsWithProvider();
    const fontSourceFonts = getFontSourceSubsetCached(0, 999999);
    const openFoundryFonts = getOpenFoundrySubsetCached(0, 999999);

    fontListCache.all = [
      ...googleFonts,
      ...adobeFontList,
      ...fontSquirrelList,
      ...customFontList,
      ...fontSourceFonts,
      ...openFoundryFonts,
    ];
  }

  return fontListCache.all;
};

// Track which providers have been loaded
const loadedProviders = {
  adobe: false,
  fontSquirrel: false,
  custom: false,
  fontSource: false,
  openFoundry: false,
};

// Load fonts for a specific provider on demand
export const loadFontsByProvider = (provider: string): void => {
  if (typeof window === "undefined") return;

  // Skip if already loaded
  if (loadedProviders[provider as keyof typeof loadedProviders]) return;

  switch (provider) {
    case "adobe":
      loadAdobeFonts();
      loadedProviders.adobe = true;
      break;
    case "fontSquirrel":
      loadFontSquirrelFonts();
      loadedProviders.fontSquirrel = true;
      break;
    case "custom":
      loadCustomFonts();
      loadedProviders.custom = true;
      break;
    case "fontSource":
      loadFontSourceFonts();
      loadedProviders.fontSource = true;
      break;
    case "openFoundry":
      loadOpenFoundryFonts();
      loadedProviders.openFoundry = true;
      break;
  }
};

// Load additional fonts for a specific provider
export const loadMoreFontsByProvider = async (
  provider: string,
): Promise<number> => {
  if (typeof window === "undefined") return 0;

  // Only handle providers that support incremental loading
  switch (provider) {
    case "fontSquirrel":
      console.log(`Loading more fonts for provider: ${provider}`);
      const newCount = await loadMoreFontSquirrelFonts();

      // Clear cache for this provider to ensure we get fresh data
      if (newCount > 0) {
        clearFontCache(`provider_${provider}`);
      }

      return newCount;
    case "fontSource":
    case "openFoundry":
      // Currently not supported
      console.log(`Incremental loading not supported for ${provider}`);
      return 0;
    default:
      console.log(`Provider ${provider} does not support incremental loading`);
      return 0;
  }
};

// Load all non-Google fonts (lazy version)
export const loadAllFonts = () => {
  if (typeof window === "undefined") return null;

  // Use requestIdleCallback to load fonts during browser idle time
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => {
      // Load minimal fonts first
      loadFontsByProvider("custom");

      // Schedule the rest with delays to avoid blocking the main thread
      setTimeout(() => {
        loadFontsByProvider("adobe");
        loadFontsByProvider("fontSquirrel");
      }, 100);

      setTimeout(() => {
        loadFontsByProvider("fontSource");
        loadFontsByProvider("openFoundry");
      }, 300);
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    // Load minimal fonts immediately
    loadFontsByProvider("custom");

    // Schedule the rest
    setTimeout(() => {
      loadFontsByProvider("adobe");
      loadFontsByProvider("fontSquirrel");

      setTimeout(() => {
        loadFontsByProvider("fontSource");
        loadFontsByProvider("openFoundry");
      }, 200);
    }, 100);
  }

  return null;
};

// Filter fonts by provider - optimized with caching
export const getFontsByProvider = (
  provider:
    | "google"
    | "adobe"
    | "fontSquirrel"
    | "custom"
    | "fontSource"
    | "openFoundry",
): ExtendedFontItem[] => {
  const cacheKey = `provider_${provider}`;

  // Return from cache if available
  if (fontListCache[cacheKey]) {
    return fontListCache[cacheKey];
  }

  // Provider-specific optimized fetching
  if (provider === "google") {
    fontListCache[cacheKey] = getGoogleFontsWithProvider();
    return fontListCache[cacheKey];
  }

  if (provider === "fontSource") {
    fontListCache[cacheKey] = getFontSourceSubsetCached(0, 999999);
    return fontListCache[cacheKey];
  }

  if (provider === "openFoundry") {
    fontListCache[cacheKey] = getOpenFoundrySubsetCached(0, 999999);
    return fontListCache[cacheKey];
  }

  // For other providers, filter from the list
  // Create a temporary provider-specific list if not cached
  switch (provider) {
    case "adobe":
      fontListCache[cacheKey] = adobeFontList;
      break;
    case "fontSquirrel":
      fontListCache[cacheKey] = fontSquirrelList;
      break;
    case "custom":
      fontListCache[cacheKey] = customFontList;
      break;
    default:
      // Fallback - filter from the complete list
      fontListCache[cacheKey] = getAllFontList().filter(
        (font) => font.provider === provider,
      );
  }

  return fontListCache[cacheKey];
};

// Get font providers available in the current setup - cached
let availableProvidersCache: string[] | null = null;

export const getAvailableProviders = (): (
  | "google"
  | "adobe"
  | "fontSquirrel"
  | "custom"
  | "fontSource"
  | "openFoundry"
)[] => {
  // Return from cache if available
  if (availableProvidersCache) {
    return availableProvidersCache as any[];
  }

  const providers: (
    | "google"
    | "adobe"
    | "fontSquirrel"
    | "custom"
    | "fontSource"
    | "openFoundry"
  )[] = [];

  // Only check length, avoid filtering operations
  if (getGoogleFontsWithProvider().length > 0) providers.push("google");
  if (adobeFontList.length > 0) providers.push("adobe");
  if (fontSquirrelList.length > 0) providers.push("fontSquirrel");
  if (customFontList.length > 0) providers.push("custom");
  if (fontSourceList.length > 0) providers.push("fontSource");
  if (openFoundryList.length > 0) providers.push("openFoundry");

  // Cache the result
  availableProvidersCache = providers;

  return providers;
};

// Function to clear the cache when needed (e.g., when font lists are updated)
export const clearFontCache = (specificCache?: string) => {
  if (specificCache) {
    delete fontListCache[specificCache];
  } else {
    // Clear all caches
    Object.keys(fontListCache).forEach((key) => {
      delete fontListCache[key];
    });
    availableProvidersCache = null;
  }
};
