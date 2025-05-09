import { NextRequest, NextResponse } from "next/server";

/**
 * Font proxy for Open Foundry fonts
 *
 * This API route proxies requests to Open Foundry font files to avoid CORS issues.
 * It will fetch the font file from Open Foundry and serve it with appropriate headers.
 */

// Map of font extensions to MIME types
const MIME_TYPES: Record<string, string> = {
  otf: "font/otf",
  ttf: "font/ttf",
  woff: "font/woff",
  woff2: "font/woff2",
};

// Map for special case font files with different naming conventions
// This maps the font IDs from the API to the correct filenames as used in fonts.css
const FONT_NAME_MAPPING: Record<string, string> = {
  "aileron-ultralight": "Aileron-Ultralight.otf",
  "archivo-black": "Archivo-Black.otf",
  "archivo-narrow-regular": "Archivo-Narrow-Regular.otf",
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
  "roboto-black-italic": "Roboto-Black-Italic.otf",
  "terminal-grotesque-open": "Terminal-Grotesque-Open.otf",
  "tex-gyre-heros-bold-italic": "texgyreheros-bolditalic.otf",
  "tex-gyre-heros-condensed-regular": "texgyreheroscn-regular.otf",
  "work-sans-extra-bold": "WorkSans-ExtraBold.otf",
  "work-sans-light": "WorkSans-Light.otf",
  "young-serif-regular": "YoungSerif-Regular.otf",
};

export async function GET(
  request: NextRequest,
  { params }: { params: { fontId: string } },
) {
  try {
    const fontId = params.fontId;
    if (!fontId) {
      return NextResponse.json(
        { error: "Font ID is required" },
        { status: 400 },
      );
    }

    // If the request is for a font file directly (includes extension)
    if (fontId.includes(".")) {
      const fontUrl = `https://open-foundry.com/data/fonts/${fontId}`;
      console.log(`Proxying direct font request to: ${fontUrl}`);

      return await fetchAndServeFont(fontUrl);
    }

    // Otherwise, check for a mapping or use normalized name
    const lowercaseFontId = fontId.toLowerCase();
    let fontFileName;

    // Check if we have a special mapping for this font
    if (FONT_NAME_MAPPING[lowercaseFontId]) {
      fontFileName = FONT_NAME_MAPPING[lowercaseFontId];
    } else {
      // Create a standardized filename from the ID
      fontFileName = `${fontId}.otf`;
    }

    const fontUrl = `https://open-foundry.com/data/fonts/${fontFileName}`;
    console.log(`Proxying mapped font request to: ${fontUrl}`);

    return await fetchAndServeFont(fontUrl);
  } catch (error) {
    console.error("Error fetching font:", error);
    return NextResponse.json(
      { error: "Failed to fetch font" },
      { status: 500 },
    );
  }
}

/**
 * Helper function to fetch and serve a font file
 */
async function fetchAndServeFont(fontUrl: string): Promise<NextResponse> {
  // Determine the file extension
  const extension = fontUrl.split(".").pop()?.toLowerCase() || "otf";

  // Fetch the font file from Open Foundry
  const fontResponse = await fetch(fontUrl, {
    method: "GET",
    headers: {
      Accept: "*/*",
      "User-Agent": "Mozilla/5.0 (compatible; Wordmark/1.0)",
      Referer: "https://open-foundry.com/",
      Origin: "https://open-foundry.com",
    },
  });

  if (!fontResponse.ok) {
    // Try with .ttf if .otf fails
    if (extension === "otf") {
      const ttfUrl = fontUrl.replace(".otf", ".ttf");
      console.log(`Trying TTF instead: ${ttfUrl}`);

      const ttfResponse = await fetch(ttfUrl, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "User-Agent": "Mozilla/5.0 (compatible; Wordmark/1.0)",
          Referer: "https://open-foundry.com/",
          Origin: "https://open-foundry.com",
        },
      });

      if (ttfResponse.ok) {
        // Return the TTF file
        const fontData = await ttfResponse.arrayBuffer();
        return new NextResponse(fontData, {
          status: 200,
          headers: {
            "Content-Type": MIME_TYPES["ttf"] || "font/ttf",
            "Cache-Control": "public, max-age=31536000", // Cache for 1 year
          },
        });
      }
    }

    console.error(`Failed to fetch font: ${fontUrl} (${fontResponse.status})`);
    return NextResponse.json(
      { error: `Failed to fetch font: ${fontResponse.status}` },
      { status: fontResponse.status },
    );
  }

  // Get the font data as array buffer
  const fontData = await fontResponse.arrayBuffer();

  // Return the font data with appropriate headers
  return new NextResponse(fontData, {
    status: 200,
    headers: {
      "Content-Type": MIME_TYPES[extension] || "font/otf",
      "Cache-Control": "public, max-age=31536000", // Cache for 1 year
    },
  });
}
