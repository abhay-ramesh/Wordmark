import { ThemeProvider } from "@/components/custom/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import GoogleAnalytics from "./GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wordmark - Logo Maker with Google Fonts",
  description:
    "Meet Wordmark - Your Logo Maker with Google Fonts. No fuss, just smart logo creation. Pick from Google's font treasure and craft your brand's vibe. Perfect for devs, easy for all entrepreneurs.",
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
    title: "Wordmark - Logo Maker with Google Fonts",
    description:
      "Meet Wordmark - Your Logo Maker with Google Fonts. No fuss, just smart logo creation. Pick from Google's font treasure and craft your brand's vibe. Perfect for devs, easy for all entrepreneurs.",
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
  abstract: "Meet Wordmark - Your Logo Maker with Google Fonts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={
          inter.className +
          " flex min-h-screen flex-col-reverse justify-end space-y-2 space-y-reverse bg-muted  p-4 md:h-screen md:flex-row md:space-x-2 md:space-y-0"
        }
      >
        <GoogleAnalytics />
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
        {children}
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
