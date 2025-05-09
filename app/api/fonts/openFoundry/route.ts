import { NextResponse } from "next/server";

// Open Foundry API endpoints
const OPEN_FOUNDRY_API = "https://open-foundry.com/data/sheet.json";
const OPEN_FOUNDRY_CSS = "https://open-foundry.com/data/fonts.css";

// Map for special case font files with different naming conventions
// This maps the font IDs from the API to the correct filenames as used in fonts.css
const FONT_NAME_MAPPING: Record<string, string> = {
  "aileron-ultralight": "Aileron-UltraLight.otf",
  "archivo-black": "ArchivoBlack.otf",
  "archivo-narrow-regular": "ArchivoNarrow-Regular.otf",
  "bagnard-regular": "Bagnard.otf",
  "bagnard-sans-regular": "BagnardSans.otf",
  "bluu-next-bold": "BluuNext-Bold.otf",
  "cooper-hewitt-heavy": "CooperHewitt-Heavy.otf",
  "cotham-regular": "CothamSans.otf",
  "eb-garamond-regular": "EBGaramond12-Regular.otf",
  "gap-sans-bold": "GapSansBold.ttf",
  "junicode-bold-condensed": "Junicode-BoldCondensed.ttf",
  "league-gothic-italic": "LeagueGothic-Italic.otf",
  "liberation-sans-bold": "LiberationSans-Bold.otf",
  "libre-baskerville-regular": "LibreBaskerville-Regular.otf",
  "mplus-mtype-1-light": "mplus-1m-light.otf",
  "nimbus-sans-l-bold": "nimbus-sans-l_bold.otf",
  "office-code-pro-light": "OfficeCodePro-Light.otf",
  "ostrich-sans-heavy": "OstrichSans-Heavy.otf",
  "roboto-black-italic": "Roboto-BlackItalic.otf",
  "terminal-grotesque-open": "terminal-grotesque_open.otf",
  "tex-gyre-heros-bold-italic": "texgyreheros-bolditalic.otf",
  "tex-gyre-heros-condensed-regular": "texgyreheroscn-regular.otf",
  "work-sans-extra-bold": "WorkSans-ExtraBold.otf",
  "work-sans-light": "WorkSans-Light.otf",
  "young-serif-regular": "YoungSerif-Regular.otf",
};

// Interface for Open Foundry API response items
interface OpenFoundryApiItem {
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

// Font file mapping from CSS
interface FontFileMapping {
  [fontId: string]: {
    fontFamily: string;
    className: string;
    fileName: string;
  };
}

// Processed font data structure
interface ProcessedFont {
  family: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  files: {
    regular: string;
    italic?: string;
    bold?: string;
    boldItalic?: string;
  };
  category: string;
  kind: string;
  menu: string;
  provider: string;
  sourceId: string;
  license: string;
  classification: string;
  creator?: string;
  about?: string;
}

// Cache for API response to avoid redundant requests
let cachedFonts: ProcessedFont[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds

// Cache for font file mappings
let fontFileMappings: FontFileMapping | null = null;

/**
 * Extract font file mappings from CSS
 */
async function extractFontMappings(): Promise<FontFileMapping> {
  // Return cached mappings if available
  if (fontFileMappings) {
    return fontFileMappings;
  }

  try {
    console.log("Fetching font CSS from Open Foundry...");
    const response = await fetch(OPEN_FOUNDRY_CSS);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSS: ${response.status}`);
    }

    const css = await response.text();
    const mappings: FontFileMapping = {};

    // Extract font family and file name from CSS
    const fontFaceRegex =
      /@font-face\s*{\s*font-family:\s*'([^']+)';\s*src:\s*url\('fonts\/([^']+)'\)/g;
    const classRegex = /\.([a-z0-9_]+)\s*{\s*font-family:\s*'([^']+)'/g;

    let match;
    // Extract font-face declarations
    while ((match = fontFaceRegex.exec(css)) !== null) {
      const fontFamily = match[1];
      const fileName = match[2];
      const fontId = fileName.split(".")[0].toLowerCase();

      if (!mappings[fontId]) {
        mappings[fontId] = {
          fontFamily,
          className: "",
          fileName,
        };
      } else {
        mappings[fontId].fontFamily = fontFamily;
        mappings[fontId].fileName = fileName;
      }
    }

    // Extract class names
    while ((match = classRegex.exec(css)) !== null) {
      const className = match[1];
      const fontFamily = match[2];

      // Find the matching entry by font family
      for (const fontId in mappings) {
        if (mappings[fontId].fontFamily === fontFamily) {
          mappings[fontId].className = className;
          break;
        }
      }
    }

    console.log(
      `Extracted ${Object.keys(mappings).length} font mappings from CSS`,
    );
    fontFileMappings = mappings;
    return mappings;
  } catch (error) {
    console.error("Failed to extract font mappings:", error);
    return {};
  }
}

/**
 * Get the correct font file name based on font ID
 */
function getFontFileName(fontId: string): string {
  const lowercaseFontId = fontId.toLowerCase();

  // Check if we have a special mapping for this font
  if (FONT_NAME_MAPPING[lowercaseFontId]) {
    return FONT_NAME_MAPPING[lowercaseFontId];
  }

  // Otherwise create a standardized file name
  // Convert kebab-case to PascalCase for the filename
  const formattedName = fontId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");

  return `${formattedName}.otf`;
}

/**
 * Process an Open Foundry API item into a standardized font format
 */
function processFont(
  font: OpenFoundryApiItem,
  fontMappings: FontFileMapping,
): ProcessedFont {
  // Determine style and weight
  const isItalic = font["info-style"]?.toLowerCase().includes("italic");
  const isBold = font["info-weight"] >= 700;
  const fontStyle = font["font-style"]?.toLowerCase() || "";

  // Create the variants array
  const variants: string[] = [];
  variants.push("regular");
  if (isItalic) variants.push("italic");
  if (isBold) variants.push("bold");
  if (isBold && isItalic) variants.push("bold-italic");

  // Generate proper font family name
  // For fonts with distinctive styles like "Black" or "Narrow Regular", include in family name
  // This better matches how these font families are referenced in CSS
  let familyName = font["font-name"];

  // Special case handling for common style words that should be part of the family name
  const styleWords = [
    "black",
    "narrow",
    "condensed",
    "expanded",
    "thin",
    "light",
    "medium",
    "heavy",
    "ultra",
  ];
  const styleIncludesSpecialWord = styleWords.some((word) =>
    fontStyle.toLowerCase().includes(word),
  );

  if (styleIncludesSpecialWord) {
    familyName = `${font["font-name"]} ${font["font-style"]}`;
  }

  // Create category from classification
  let category = "sans-serif";
  if (font["info-classification"]?.toLowerCase().includes("serif")) {
    category = "serif";
  } else if (font["info-classification"]?.toLowerCase().includes("mono")) {
    category = "monospace";
  } else if (font["info-classification"]?.toLowerCase().includes("display")) {
    category = "display";
  }

  // Get the correct font file name
  const fontFileName = getFontFileName(font["font-id"]);

  // Create the proxy URL for the font
  const fontUrl = `/api/fonts/openFoundry/${fontFileName}`;

  return {
    family: familyName,
    variants,
    subsets: ["latin"],
    version: "v1",
    lastModified: new Date().toISOString().split("T")[0],
    files: {
      regular: fontUrl,
    },
    category,
    kind: "webfont",
    menu: "",
    provider: "openFoundry",
    sourceId: font["font-id"],
    license: font["info-license"] || "OFL",
    classification: font["info-classification"] || "Sans Serif",
    creator: font["font-creator"],
    about: font["info-about"],
  };
}

/**
 * Fetch and process Open Foundry fonts
 */
async function fetchOpenFoundryFonts(): Promise<ProcessedFont[]> {
  // Return cached results if available and recent
  const now = Date.now();
  if (cachedFonts && now - cacheTime < CACHE_DURATION) {
    console.log("Returning cached Open Foundry fonts");
    return cachedFonts;
  }

  try {
    // Fetch font file mappings from CSS
    const fontMappings = await extractFontMappings();

    console.log("Fetching fonts from Open Foundry API...");
    const response = await fetch(OPEN_FOUNDRY_API, {
      headers: {
        Accept: "application/json",
      },
      // Add cache control
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from API: ${response.status}`);
    }

    const data: OpenFoundryApiItem[] = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid API response format");
    }

    console.log(`Processing ${data.length} fonts from Open Foundry API`);

    // Process each font
    const processedFonts = data.map((font) => processFont(font, fontMappings));

    // Log example of processed fonts
    console.log("Sample font URLs:");
    processedFonts.slice(0, 3).forEach((font) => {
      console.log(`- ${font.family}: ${font.files.regular}`);
    });

    // Update cache
    cachedFonts = processedFonts;
    cacheTime = now;

    return processedFonts;
  } catch (error) {
    console.error("Failed to fetch Open Foundry fonts:", error);
    // Return empty array or cached data if available
    return cachedFonts || [];
  }
}

/**
 * GET handler for the Open Foundry fonts API endpoint
 */
export async function GET() {
  try {
    const fonts = await fetchOpenFoundryFonts();

    return NextResponse.json(
      {
        success: true,
        count: fonts.length,
        fonts,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch fonts",
      },
      { status: 500 },
    );
  }
}
