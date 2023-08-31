import { ThemeProvider } from "@/components/custom/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wordmark - Logo Maker with Google Fonts",
  description:
    "Meet Wordmark - Your Logo Maker with Google Fonts. No fuss, just smart logo creation. Pick from Google's font treasure and craft your brand's vibe. Perfect for devs, easy for all entrepreneurs.",
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
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
        {children}
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
