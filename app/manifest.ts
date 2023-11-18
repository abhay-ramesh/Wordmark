import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    short_name: "Wordmark",
    name: "Wordmark - Google Fonts Logo Maker",
    description:
      "Meet Wordmark - Google Fonts Logo Maker. No fuss, just smart logo creation. Pick from Google's font treasure and craft your brand's vibe. Perfect for devs, easy for all entrepreneurs.",
    icons: [
      {
        src: "/icons/wordmark-icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/icons/wordmark-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/wordmark-icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/icons/wordmark-icon-64x64.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/icons/wordmark-icon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icons/wordmark-icon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    id: "/?source=pwa",
    start_url: "/?source=pwa",
    display: "fullscreen",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "en",
    dir: "ltr",
    scope: "/",
    prefer_related_applications: false,
    related_applications: [],
    categories: [
      "productivity",
      "utilities",
      "tools",
      "design",
      "graphics",
      "logo",
      "maker",
      "generator",
    ],
  };
}
