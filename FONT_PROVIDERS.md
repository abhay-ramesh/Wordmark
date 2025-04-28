# Font Providers in Wordmark

This document explains how to add and use different font providers in the Wordmark application.

## Available Font Providers

The application now supports multiple font providers:

1. **Google Fonts** (default)
2. **Adobe Fonts** (Typekit)
3. **Font Squirrel** (self-hosted web fonts)
4. **Custom Fonts** (locally hosted fonts)
5. **Font Source** (fonts from font-source-fonts.json)

## How to Add Fonts from Different Providers

### 1. Google Fonts

Google Fonts are already integrated via the `data/fonts.json` file. To add more Google Fonts, you can update this file with additional entries following the same format.

### 2. Adobe Fonts (Typekit)

To add Adobe Fonts:

1. Create a Typekit project at [Adobe Fonts](https://fonts.adobe.com/)
2. Get your project ID
3. Update the `TYPEKIT_ID` constant in `lib/fontProviders/adobe.ts`
4. Add your font entries to the `adobeFontList` array in the same file

Example entry:

```typescript
{
  family: 'adobe-caslon-pro',
  variants: ['regular', 'italic', '700'],
  subsets: ['latin'],
  version: '1.0',
  lastModified: '2023-01-01',
  files: {
    regular: ''  // Adobe fonts don't need direct file URLs
  },
  category: 'serif',
  kind: 'webfont',
  menu: '',
  provider: 'adobe',
  kitId: TYPEKIT_ID
}
```

### 3. Font Squirrel Fonts

The Font Squirrel integration now uses the official Font Squirrel API to automatically load all available fonts. The following API endpoints are used:

- **Classifications**: `https://www.fontsquirrel.com/api/classifications` - Get categories with font counts
- **Font Families**: `https://www.fontsquirrel.com/api/fontlist/all` - Get all font families
- **Family Info**: `https://www.fontsquirrel.com/api/familyinfo/{family_urlname}` - Get details about specific fonts
- **Font Kit**: `https://www.fontsquirrel.com/fontfacekit/{family_urlname}` - Download the font-face kit

The Font Squirrel fonts are loaded automatically when the application starts. The provider fetches all available fonts from the Font Squirrel API and makes them available in the font selector.

#### Adding custom Font Squirrel fonts

While the API integration should provide all fonts automatically, you can still manually add specific Font Squirrel fonts if needed:

```typescript
// In lib/fontProviders/fontSquirrel.ts
fontSquirrelList.push({
  family: "your-font-name",
  variants: ["regular", "italic", "bold", "bold-italic"],
  subsets: ["latin"],
  version: "1.0",
  lastModified: "2023-11-01",
  files: {
    regular: "https://www.fontsquirrel.com/fontfacekit/your-font-name"
  },
  category: "sans-serif",
  kind: "webfont",
  menu: "",
  provider: "fontSquirrel",
  kitUrl: "https://www.fontsquirrel.com/fontfacekit/your-font-name"
});
```

#### Self-hosted approach (manual)

If you prefer to host the fonts yourself:

1. Download fonts from [Font Squirrel](https://www.fontsquirrel.com/)
2. Generate web fonts using their [Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator)
3. Place the web font files in your project at `/public/fonts/[font-name]/`
4. Create a CSS file for the font (or use the one generated)
5. Add font entries to the `fontSquirrelList` array in `lib/fontProviders/fontSquirrel.ts`

Example entry for self-hosted fonts:

```typescript
{
  family: 'metropolis',
  variants: ['regular', 'italic', 'bold', 'bold-italic'],
  subsets: ['latin'],
  version: '1.0',
  lastModified: '2023-01-01',
  files: {
    regular: '/fonts/metropolis/metropolis-regular-webfont.woff2',
    italic: '/fonts/metropolis/metropolis-italic-webfont.woff2',
    bold: '/fonts/metropolis/metropolis-bold-webfont.woff2',
    boldItalic: '/fonts/metropolis/metropolis-bold-italic-webfont.woff2'
  },
  category: 'sans-serif',
  kind: 'webfont',
  menu: '',
  provider: 'fontSquirrel',
  cssUrl: '/fonts/metropolis/stylesheet.css',
  directLoad: false
}
```

### 4. Custom Fonts

To add custom fonts:

1. Add your font files (WOFF2 format recommended) to `/public/fonts/custom/`
2. Add font entries to the `customFontList` array in `lib/fontProviders/custom.ts`

Example entry:

```typescript
{
  family: 'MyCustomFont',
  variants: ['regular', 'bold'],
  subsets: ['latin'],
  version: '1.0',
  lastModified: '2023-01-01',
  files: {
    regular: '/fonts/custom/my-custom-font.woff2',
    bold: '/fonts/custom/my-custom-font-bold.woff2'
  },
  category: 'sans-serif',
  kind: 'webfont',
  menu: '',
  provider: 'custom',
  fontFace: [
    {
      family: 'MyCustomFont',
      style: 'normal',
      weight: '400',
      src: '/fonts/custom/my-custom-font.woff2'
    },
    {
      family: 'MyCustomFont',
      style: 'normal',
      weight: '700',
      src: '/fonts/custom/my-custom-font-bold.woff2'
    }
  ]
}
```

### 5. Font Source

The Font Source provider uses fonts from the `data/font-source-fonts.json` file. This provider automatically processes the JSON data and makes the fonts available in the application.

#### Adding more Font Source fonts

If you want to add more fonts to the Font Source provider:

1. Add new entries to the `data/font-source-fonts.json` file following the same structure:

```json
{
  "id": "font-id",
  "family": "Font Family Name",
  "subsets": ["latin", "latin-ext"],
  "weights": [400, 700],
  "styles": ["normal", "italic"],
  "defSubset": "latin",
  "variable": false,
  "lastModified": "2024-01-01",
  "category": "sans-serif",
  "license": "OFL-1.1",
  "type": "google"
}
```

2. By default, only the first 200 fonts are loaded for performance reasons. If you want to change this limit, modify the `getFontSourceSubset` function call in `lib/fontProviders/index.ts`:

```typescript
const fontSourceListSubset = getFontSourceSubset(0, 200); // Change 200 to your desired limit
```

#### Supported font types

Currently, the Font Source provider fully supports Google fonts. Support for other font types can be added by expanding the `generateFontUrl` function in `lib/fontProviders/fontSource.ts`.

## Implementation Details

The font provider system consists of several components:

1. **Provider-specific modules** in `lib/fontProviders/` for each provider
2. **Combined interface** in `lib/fontProviders/index.ts` that brings all providers together
3. **FontProviderSelector component** that allows switching between providers
4. **Updated FontSelector component** that works with all providers

## Adding New Font Providers

To add a new font provider:

1. Create a new file in `lib/fontProviders/` for the provider
2. Implement the provider interface with proper loading mechanism
3. Update the `ExtendedFontItem` interface in `lib/fontProviders/index.ts`
4. Add the new provider to the `allFontList` in the index file
5. Update the provider names in the `FontProviderSelector` component
