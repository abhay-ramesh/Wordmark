import { FontItem } from "@/lib/fonts";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { z } from "zod";

/**
 * Font Squirrel integration using the official Font Squirrel API
 * https://www.fontsquirrel.com/blog/2010/07/the-font-squirrel-api
 */

// Extended FontFiles interface to include boldItalic
interface FontSquirrelFiles {
  regular: string;
  italic?: string;
  bold?: string;
  boldItalic?: string;
}

export interface FontSquirrelItem extends Omit<FontItem, "files"> {
  provider: "fontSquirrel";
  files: FontSquirrelFiles;
  cssUrl?: string; // URL to the CSS file
  directLoad?: boolean; // Flag to indicate if font should be loaded directly
  kitUrl?: string; // URL to the font-face kit
  classification?: string; // Font classification/category
  isLoaded?: boolean; // Flag to track if font asset has been loaded
  shouldPreload?: boolean; // Flag to indicate if font should be preloaded
}

// FontSquirrel API endpoint URLs
const API = {
  CLASSIFICATIONS: "https://www.fontsquirrel.com/api/classifications",
  FAMILIES_ALL: "https://www.fontsquirrel.com/api/fontlist/all",
  FAMILIES_BY_CLASS: "https://www.fontsquirrel.com/api/fontlist/",
  FAMILY_INFO: "https://www.fontsquirrel.com/api/familyinfo/",
  FONT_KIT: "https://www.fontsquirrel.com/fontfacekit/",
};

// Proxy configuration
const PROXY_URL = "https://cors-anywhere.herokuapp.com";
const BACKUP_PROXY_URL = "https://api.allorigins.win/raw";

// Create axios instance with default configuration
const api = axios.create({
  headers: {
    Accept: "application/json",
    "User-Agent": "Wordmark App/1.0",
    Origin: "https://wordmark.app",
  },
  timeout: 8000, // 8 second timeout
});

// Request interceptor for handling CORS issues
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only retry once
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // If error is CORS-related or network error
    if (
      (error.response && error.response.status === 0) ||
      error.code === "ERR_NETWORK" ||
      (error.message &&
        (error.message.includes("Network Error") ||
          error.message.includes("CORS")))
    ) {
      originalRequest._retry = true;

      // Try with primary proxy
      try {
        const proxyUrl = `${PROXY_URL}/${originalRequest.url}`;
        const response = await axios({
          ...originalRequest,
          url: proxyUrl,
        });
        return response;
      } catch (proxyError) {
        // Try with backup proxy if primary fails
        try {
          const backupProxyUrl = `${BACKUP_PROXY_URL}?url=${encodeURIComponent(
            originalRequest.url || "",
          )}`;
          const response = await axios({
            ...originalRequest,
            url: backupProxyUrl,
          });
          return response;
        } catch (backupProxyError) {
          return Promise.reject(backupProxyError);
        }
      }
    }

    return Promise.reject(error);
  },
);

// Zod schema for API response validation
const FontFamilySchema = z.object({
  family_urlname: z.string(),
  family_name: z.string(),
  classification: z.string().optional(),
});

const FontFamiliesSchema = z.array(FontFamilySchema);

// Cache for API responses with expiration
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class APICache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    // Check if cache item has expired
    if (Date.now() > item.timestamp + item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set<T>(key: string, data: T, expiry = this.DEFAULT_EXPIRY): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  // Get all families with caching
  async getAllFamilies(): Promise<z.infer<typeof FontFamiliesSchema>> {
    const cacheKey = "allFamilies";
    const cached = this.get<z.infer<typeof FontFamiliesSchema>>(cacheKey);

    if (cached) return cached;

    try {
      const response = await api.get(API.FAMILIES_ALL);
      const parsed = FontFamiliesSchema.parse(response.data);
      this.set(cacheKey, parsed);
      return parsed;
    } catch (error) {
      // Handle parsing errors
      if (error instanceof z.ZodError) {
        throw new Error("Invalid API response format");
      }
      throw error;
    }
  }

  // Track font observers
  fontObservers: Map<string, IntersectionObserver> = new Map();

  // Track loaded fonts
  loadedFonts: Set<string> = new Set();
}

// Create cache instance
const apiCache = new APICache();

// Constants for batch loading - reduced initial size for faster startup
const INITIAL_BATCH_SIZE = 20;
const ADDITIONAL_BATCH_SIZE = 30;
const MAX_CONCURRENT_REQUESTS = 6;

// Track loading state to avoid duplicate requests
let isLoadingFonts = false;
let currentOffset = 0;
let hasMoreFonts = true;
let totalAvailableFonts = 0;

// Advanced font loading strategy - adjusted for better performance
interface FontLoadingStrategy {
  preloadPopularFonts: boolean;
  lazyLoadAssets: boolean;
  useIntersectionObserver: boolean;
  loadLimits: {
    immediate: number;
    visible: number;
    deferred: number;
  };
}

// Performance-optimized strategy
const loadingStrategy: FontLoadingStrategy = {
  preloadPopularFonts: true,
  lazyLoadAssets: true,
  useIntersectionObserver: true,
  loadLimits: {
    immediate: 10, // Reduced from 20 to 10 for faster initial load
    visible: 50, // Reduced from 100 to 50
    deferred: 150, // Reduced from 300 to 150
  },
};

// Top priority fonts - only the most essential ones
const popularFonts = [
  "open-sans",
  "roboto",
  "lato",
  "montserrat",
  "source-sans-pro",
];

// Track loaded font assets using weak map for better garbage collection
let fontLoadPromises = new Map<string, Promise<void>>();

// Debounce helper function to prevent excessive function calls
const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Fetch data with retry capability and improved error handling
 */
async function fetchWithRetry<T>(
  url: string,
  options: { retries?: number; backoff?: number } = {},
): Promise<T> {
  const { retries = 3, backoff = 300 } = options;

  try {
    const response = await api.get<T>(url);
    return response.data;
  } catch (error) {
    if (retries <= 0) throw error;

    // Exponential backoff with jitter
    const delay =
      backoff * Math.pow(2, 4 - retries) * (0.9 + Math.random() * 0.2);

    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry<T>(url, { retries: retries - 1, backoff });
  }
}

// Initialize font list with metadata but lazy load actual font assets
const initializeFontList = async (): Promise<void> => {
  if (isLoadingFonts) return;

  isLoadingFonts = true;

  try {
    // Try to get data from cache first
    const families = await apiCache.getAllFamilies();

    totalAvailableFonts = families.length;

    // Create optimized font items with minimal metadata
    const allFonts: FontSquirrelItem[] = families
      .filter((family) => family.family_urlname && family.family_name)
      .map((family) => ({
        family: family.family_name,
        variants: ["regular"],
        subsets: ["latin"],
        version: "1.0",
        lastModified: new Date().toISOString().split("T")[0],
        files: {
          regular: `${API.FONT_KIT}${family.family_urlname}`,
        },
        category: family.classification || "sans-serif",
        kind: "webfont",
        menu: "",
        provider: "fontSquirrel",
        cssUrl: `${API.FONT_KIT}${family.family_urlname}`,
        kitUrl: `${API.FONT_KIT}${family.family_urlname}`,
        classification: family.classification,
        isLoaded: false,
        shouldPreload: popularFonts.includes(
          family.family_urlname.toLowerCase(),
        ),
      }));

    // Sort fonts to prioritize popular ones first for faster access to common fonts
    allFonts.sort((a, b) => {
      const aIsPopular = popularFonts.includes(a.family.toLowerCase());
      const bIsPopular = popularFonts.includes(b.family.toLowerCase());

      if (aIsPopular && !bIsPopular) return -1;
      if (!aIsPopular && bIsPopular) return 1;
      return a.family.localeCompare(b.family);
    });

    fontSquirrelList = allFonts;

    // Load preselected fonts with a small delay to not block initial rendering
    if (typeof window !== "undefined") {
      queueMicrotask(() => {
        optimizedFontLoading(allFonts);
      });
    }
  } catch (error) {
    // Silent error handling to avoid console pollution
  } finally {
    isLoadingFonts = false;
  }
};

/**
 * Optimized font loading with adaptive priority
 */
const optimizedFontLoading = (fonts: FontSquirrelItem[]): void => {
  if (typeof window === "undefined") return;

  const { immediate, visible, deferred } = loadingStrategy.loadLimits;

  // 1. Load only essential fonts immediately
  const immediateLoad = fonts.filter(
    (font) => font.shouldPreload || fonts.indexOf(font) < immediate,
  );

  // Use requestAnimationFrame to load after paint
  requestAnimationFrame(() => {
    loadFontBatch(immediateLoad);
  });

  // 2. Setup intersection observer with better performance characteristics
  if (
    loadingStrategy.useIntersectionObserver &&
    "IntersectionObserver" in window
  ) {
    // Only observe fonts that might be used soon
    const visibleFonts = fonts.slice(immediate, immediate + visible);

    // Delay setup to not compete with critical rendering
    setTimeout(() => {
      setupIntersectionObservers(visibleFonts);
    }, 300);
  }

  // 3. Schedule remaining fonts for background loading
  const deferredFonts = fonts.slice(
    immediate + visible,
    immediate + visible + deferred,
  );

  if (deferredFonts.length > 0) {
    const loadDeferredBatch = () => {
      loadFontBatchProgressively(deferredFonts);
    };

    // Use idle callback for maximum performance
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadDeferredBatch, { timeout: 5000 });
    } else {
      // Fallback with longer delay
      setTimeout(loadDeferredBatch, 3000);
    }
  }
};

/**
 * Performance-optimized intersection observer setup
 */
const setupIntersectionObservers = (fonts: FontSquirrelItem[]): void => {
  if (typeof window === "undefined") return;

  // Group fonts by category to reduce number of observers
  const fontsByCategory = new Map<string, FontSquirrelItem[]>();
  fonts.forEach((font) => {
    const category = font.category || "sans-serif";
    if (!fontsByCategory.has(category)) {
      fontsByCategory.set(category, []);
    }
    fontsByCategory.get(category)!.push(font);
  });

  // Create consolidated observers for each category
  fontsByCategory.forEach((categoryFonts, category) => {
    // Cleanup previous observer if it exists
    if (apiCache.fontObservers.has(category)) {
      apiCache.fontObservers.get(category)!.disconnect();
    }

    // Single observer per category
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fontName = entry.target.getAttribute("data-font");
            if (fontName) {
              const font = categoryFonts.find((f) => f.family === fontName);
              if (font && !apiCache.loadedFonts.has(font.family)) {
                // Load font asynchronously
                queueMicrotask(() => loadFontAsset(font));
                observer.unobserve(entry.target);
              }
            }
          }
        });
      },
      {
        rootMargin: "150px", // Increased from 100px for earlier loading
        threshold: 0.01, // Lower threshold to load sooner
      },
    );

    apiCache.fontObservers.set(category, observer);

    // Observe all font elements for this category
    const observeFontElements = debounce(() => {
      document
        .querySelectorAll(`[data-font][data-category="${category}"]`)
        .forEach((el) => {
          if (!el.hasAttribute("data-observed")) {
            observer.observe(el);
            el.setAttribute("data-observed", "true");
          }
        });
    }, 100);

    // Initial observation
    observeFontElements();

    // Re-run on document changes
    if ("MutationObserver" in window) {
      const mutationObserver = new MutationObserver(observeFontElements);
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Cleanup after 30 seconds to save resources
      setTimeout(() => {
        mutationObserver.disconnect();
      }, 30000);
    }
  });
};

/**
 * Load fonts progressively with resource constraints
 */
const loadFontBatchProgressively = (fonts: FontSquirrelItem[]): void => {
  if (typeof window === "undefined" || fonts.length === 0) return;

  // Reduced chunk size for smoother loading
  const CHUNK_SIZE = 5;
  let index = 0;

  const loadNextChunk = () => {
    // Check if browser is idle
    if (document.hidden) {
      // Schedule to try again when document is visible
      document.addEventListener(
        "visibilitychange",
        () => {
          if (!document.hidden) {
            loadNextChunk();
          }
        },
        { once: true },
      );
      return;
    }

    const chunk = fonts.slice(index, index + CHUNK_SIZE);
    if (chunk.length === 0) return;

    loadFontBatch(chunk);
    index += CHUNK_SIZE;

    if (index < fonts.length) {
      // Use network idle detection if available
      if ("connection" in navigator && (navigator as any).connection) {
        const connection = (navigator as any).connection;
        // Adapt load strategy based on network conditions
        const delay = connection.saveData
          ? 1000
          : connection.effectiveType === "4g"
          ? 300
          : 600;

        setTimeout(loadNextChunk, delay);
      } else {
        // Standard fallback
        setTimeout(loadNextChunk, 400);
      }
    }
  };

  loadNextChunk();
};

/**
 * Optimized font asset loading with performance constraints
 */
const loadFontAsset = (font: FontSquirrelItem): Promise<void> => {
  if (typeof window === "undefined" || apiCache.loadedFonts.has(font.family)) {
    return Promise.resolve();
  }

  // Return existing promise if this font is already loading
  if (fontLoadPromises.has(font.family)) {
    return fontLoadPromises.get(font.family)!;
  }

  const loadPromise = new Promise<void>((resolve) => {
    try {
      // Prioritize native FontFace API if available
      if ("FontFace" in window && font.cssUrl) {
        // Use FontFace API for more controlled loading
        const stylesheetUrl = `${font.cssUrl}/stylesheet.css`;

        // Use axios instead of fetch for better error handling and interceptors
        api
          .get(stylesheetUrl, { responseType: "text" })
          .then((response) => {
            const css = response.data;
            // Extract @font-face declarations
            const fontFaceRegex = /@font-face\s*{([^}]*)}/g;
            let match;
            let fontFacesAdded = 0;

            while ((match = fontFaceRegex.exec(css)) !== null) {
              const fontFaceBody = match[1];

              // Extract url and format
              const urlMatch =
                /url\(['"]?([^'")]+)['"]?\)\s*format\(['"]?([^'")]+)['"]?\)/i.exec(
                  fontFaceBody,
                );
              const fontFamily = /font-family:\s*['"]?([^'";]+)['"]?/i.exec(
                fontFaceBody,
              );

              if (urlMatch && fontFamily) {
                const url = urlMatch[1];
                const format = urlMatch[2];
                const family = fontFamily[1];

                // Create and load the font
                const fontFace = new FontFace(
                  family,
                  `url(${url}) format(${format})`,
                );
                fontFace
                  .load()
                  .then(() => {
                    (document.fonts as any).add(fontFace);
                    fontFacesAdded++;
                  })
                  .catch(() => {
                    // Fallback to traditional loading on error
                    const link = document.createElement("link");
                    link.href = stylesheetUrl;
                    link.rel = "stylesheet";
                    link.type = "text/css";
                    document.head.appendChild(link);
                  });
              }
            }

            // Mark as loaded even if no @font-face rules found
            apiCache.loadedFonts.add(font.family);
            font.isLoaded = true;
            resolve();
          })
          .catch(() => {
            // Fallback to traditional loading
            const link = document.createElement("link");
            link.href = stylesheetUrl;
            link.rel = "stylesheet";
            link.type = "text/css";
            link.onload = () => {
              apiCache.loadedFonts.add(font.family);
              font.isLoaded = true;
              resolve();
            };
            link.onerror = () => {
              // Still resolve to avoid hanging promises
              resolve();
            };
            document.head.appendChild(link);
          });
      } else {
        // Traditional method as fallback
        if (font.cssUrl) {
          const link = document.createElement("link");
          link.href = `${font.cssUrl}/stylesheet.css`;
          link.rel = "stylesheet";
          link.type = "text/css";
          link.onload = () => {
            apiCache.loadedFonts.add(font.family);
            font.isLoaded = true;
            resolve();
          };
          link.onerror = () => {
            // Still resolve to avoid hanging promises
            resolve();
          };
          document.head.appendChild(link);
        } else if (font.kitUrl) {
          const link = document.createElement("link");
          link.href = `${font.kitUrl}/stylesheet.css`;
          link.rel = "stylesheet";
          link.type = "text/css";
          link.onload = () => {
            apiCache.loadedFonts.add(font.family);
            font.isLoaded = true;
            resolve();
          };
          link.onerror = () => resolve();
          document.head.appendChild(link);
        } else {
          resolve();
        }
      }
    } catch (error) {
      // Always resolve to avoid hanging promises
      resolve();
    }
  });

  // Store the promise and clean up when done
  fontLoadPromises.set(font.family, loadPromise);
  loadPromise.finally(() => {
    fontLoadPromises.delete(font.family);
  });

  return loadPromise;
};

/**
 * Batch load fonts with concurrency limit
 */
const loadFontBatch = (fonts: FontSquirrelItem[]): void => {
  if (typeof window === "undefined") return;

  // Limit concurrent font loading to avoid network contention
  const concurrencyLimit = MAX_CONCURRENT_REQUESTS;
  let activeFontLoads = 0;
  let queuedFonts = [...fonts];

  const processQueue = () => {
    while (activeFontLoads < concurrencyLimit && queuedFonts.length > 0) {
      const font = queuedFonts.shift()!;

      if (!apiCache.loadedFonts.has(font.family)) {
        activeFontLoads++;
        loadFontAsset(font).finally(() => {
          activeFontLoads--;
          // Continue processing queue
          queueMicrotask(processQueue);
        });
      }
    }
  };

  processQueue();
};

// Initial font list (will be populated by API call)
export let fontSquirrelList: FontSquirrelItem[] = [
  // Only keep the most essential sample fonts for faster initial load
  {
    family: "open-sans",
    variants: ["regular", "italic", "bold", "bold-italic"],
    subsets: ["latin"],
    version: "1.0",
    lastModified: "2023-11-01",
    files: {
      regular: "https://www.fontsquirrel.com/fontfacekit/open-sans",
    },
    category: "sans-serif",
    kind: "webfont",
    menu: "",
    provider: "fontSquirrel",
    kitUrl: "https://www.fontsquirrel.com/fontfacekit/open-sans",
  },
  {
    family: "roboto",
    variants: ["regular", "italic", "bold", "bold-italic"],
    subsets: ["latin"],
    version: "1.0",
    lastModified: "2023-11-01",
    files: {
      regular: "https://www.fontsquirrel.com/fontfacekit/roboto",
    },
    category: "sans-serif",
    kind: "webfont",
    menu: "",
    provider: "fontSquirrel",
    kitUrl: "https://www.fontsquirrel.com/fontfacekit/roboto",
  },
  {
    family: "lato",
    variants: ["regular", "italic", "bold", "bold-italic"],
    subsets: ["latin"],
    version: "1.0",
    lastModified: "2023-11-01",
    files: {
      regular: "https://www.fontsquirrel.com/fontfacekit/lato",
    },
    category: "sans-serif",
    kind: "webfont",
    menu: "",
    provider: "fontSquirrel",
    kitUrl: "https://www.fontsquirrel.com/fontfacekit/lato",
  },
];

// Performance optimized exported functions
export const loadFontSquirrelFonts = () => {
  if (typeof window === "undefined") return null;

  // Defer initialization for better initial page performance
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        if (fontSquirrelList.length <= 10) {
          initializeFontList();
        } else {
          const priorityFonts = fontSquirrelList.slice(0, 5);
          loadFontBatch(priorityFonts);
        }
      }, 300);
    });
  } else {
    // Page already loaded, can initialize with short delay
    setTimeout(() => {
      if (fontSquirrelList.length <= 10) {
        initializeFontList();
      } else {
        const priorityFonts = fontSquirrelList.slice(0, 5);
        loadFontBatch(priorityFonts);
      }
    }, 100);
  }

  return null;
};

// Optimized on-demand font loading
export const loadFontSquirrelFont = (fontFamily: string): void => {
  if (typeof window === "undefined") return;

  const font = fontSquirrelList.find((f) => f.family === fontFamily);
  if (font && !apiCache.loadedFonts.has(fontFamily)) {
    loadFontAsset(font);
  }
};

// Optimized for performance with adaptive loading
export const loadMoreFontSquirrelFonts = async (): Promise<number> => {
  if (typeof window === "undefined") return 0;

  // Initialize if needed with lower priority
  if (fontSquirrelList.length < 10 && !isLoadingFonts) {
    return new Promise((resolve) => {
      // Use requestIdleCallback to not block UI
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(
          async () => {
            await initializeFontList();
            resolve(fontSquirrelList.length);
          },
          { timeout: 2000 },
        );
      } else {
        // Fallback to setTimeout
        setTimeout(async () => {
          await initializeFontList();
          resolve(fontSquirrelList.length);
        }, 500);
      }
    });
  }

  // Load more fonts on demand with performance constraints
  const loadedCount = apiCache.loadedFonts.size;
  const nextBatchSize = Math.min(ADDITIONAL_BATCH_SIZE, 20); // Limit batch size
  const nextBatch = fontSquirrelList
    .filter((font) => !apiCache.loadedFonts.has(font.family))
    .slice(0, nextBatchSize);

  if (nextBatch.length > 0) {
    // Schedule loading for next animation frame
    requestAnimationFrame(() => {
      loadFontBatch(nextBatch);
    });
    return nextBatch.length;
  }

  return 0;
};

// Lazy initialize
if (typeof window !== "undefined" && typeof document !== "undefined") {
  // Only initialize when page is fully loaded to prioritize critical content
  if (document.readyState === "complete") {
    setTimeout(() => {
      initializeFontList();
    }, 500);
  } else {
    window.addEventListener("load", () => {
      // Delay font initialization until after initial page render
      setTimeout(() => {
        initializeFontList();
      }, 800);
    });
  }
}
