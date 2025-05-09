import { FontItem } from "@/lib/fonts";

/**
 * Custom local font integration
 */

export interface CustomFontItem extends FontItem {
  provider: "custom";
  fontFace?: FontFaceInit[];
}

export interface FontFaceInit {
  family: string;
  style?: "normal" | "italic" | "oblique";
  weight?: string;
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
  unicodeRange?: string;
  stretch?:
    | "normal"
    | "ultra-condensed"
    | "extra-condensed"
    | "condensed"
    | "semi-condensed"
    | "semi-expanded"
    | "expanded"
    | "extra-expanded"
    | "ultra-expanded";
  src: string;
}

export const loadCustomFonts = () => {
  if (typeof window === "undefined") return null;

  // Loop through custom fonts and create @font-face with FontFace API
  customFontList.forEach((font) => {
    if (font.fontFace) {
      font.fontFace.forEach((faceInit) => {
        const fontFace = new FontFace(faceInit.family, `url(${faceInit.src})`, {
          style: faceInit.style || "normal",
          weight: faceInit.weight || "normal",
          display: faceInit.display || "auto",
          unicodeRange: faceInit.unicodeRange,
          stretch: faceInit.stretch,
        });

        // Load the font
        fontFace
          .load()
          .then((loadedFace) => {
            document.fonts.add(loadedFace);
          })
          .catch((err) => {
            console.error(`Failed to load font: ${faceInit.family}`, err);
          });
      });
    }
  });

  return null;
};

// Example Custom font data structure
export const customFontList: CustomFontItem[] = [
  // You'll need to add your custom fonts here
  // Example:
  // {
  //   family: 'MyCustomFont',
  //   variants: ['regular', 'bold'],
  //   subsets: ['latin'],
  //   version: '1.0',
  //   lastModified: '2023-01-01',
  //   files: {
  //     regular: '/fonts/custom/my-custom-font.woff2',
  //     bold: '/fonts/custom/my-custom-font-bold.woff2'
  //   },
  //   category: 'sans-serif',
  //   kind: 'webfont',
  //   menu: '',
  //   provider: 'custom',
  //   fontFace: [
  //     {
  //       family: 'MyCustomFont',
  //       style: 'normal',
  //       weight: '400',
  //       src: '/fonts/custom/my-custom-font.woff2'
  //     },
  //     {
  //       family: 'MyCustomFont',
  //       style: 'normal',
  //       weight: '700',
  //       src: '/fonts/custom/my-custom-font-bold.woff2'
  //     }
  //   ]
  // }
];
