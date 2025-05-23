import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Analytics from "./GoogleAnalytics";
import { Providers } from "./Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wordmark - Google Fonts Logo Maker",
  description:
    "Meet Wordmark - Google Fonts Logo Maker. No fuss, just smart logo creation. Pick from Google's font treasure and craft your brand's vibe. Perfect for devs, easy for all entrepreneurs.",
  applicationName: "Wordmark",
  keywords: [
    "logo maker",
    "logo generator",
    "logo with google fonts",
    "google fonts logo maker",
    "google fonts logo generator",
    "logo maker with google fonts",
    "logo generator with google fonts",
    "font logo maker",
  ],
  creator: "Abhay Ramesh <abhayramesh.com>",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wordmark.abhayramesh.com/",
    title: "Wordmark - Google Fonts Logo Maker",
    description:
      "Meet Wordmark - Google Fonts Logo Maker. No fuss, just smart logo creation. Pick from Google's font treasure and craft your brand's vibe. Perfect for devs, easy for all entrepreneurs.",
    images: [
      {
        url: "https://wordmark.abhayramesh.com/Wordmark.png",
        width: 1200,
        height: 630,
        alt: "Wordmark Logo Maker",
      },
    ],
    siteName: "Wordmark",
  },
  abstract: "Meet Wordmark - Google Fonts Logo Maker.",
  themeColor: "#ffffff",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className + ""}>
        <Analytics />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
