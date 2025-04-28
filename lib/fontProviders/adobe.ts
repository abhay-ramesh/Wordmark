import { FontItem } from "@/lib/fonts";

/**
 * Adobe Fonts (Typekit) integration
 */

// Typekit project ID (replace with your own)
const TYPEKIT_ID = "YOUR_PROJECT_ID";

export interface AdobeFontItem extends FontItem {
  provider: "adobe";
  kitId?: string;
}

export const loadAdobeFonts = () => {
  if (typeof window === "undefined") return null;

  // Create script element
  const script = document.createElement("script");
  script.src = `https://use.typekit.net/${TYPEKIT_ID}.js`;
  script.async = true;

  // Add onload handler
  script.onload = () => {
    // @ts-ignore - Typekit is loaded via script
    if (window.Typekit) window.Typekit.load();
  };

  // Append to document
  document.head.appendChild(script);

  return null;
};

// Example Adobe font data structure
export const adobeFontList: AdobeFontItem[] = [
  // You'll need to add your Adobe Fonts here
  // Example:
  // {
  //   family: 'adobe-caslon-pro',
  //   variants: ['regular', 'italic', '700'],
  //   subsets: ['latin'],
  //   version: '1.0',
  //   lastModified: '2023-01-01',
  //   files: {
  //     regular: ''  // Adobe fonts don't need direct file URLs
  //   },
  //   category: 'serif',
  //   kind: 'webfont',
  //   menu: '',
  //   provider: 'adobe',
  //   kitId: TYPEKIT_ID
  // }
];
