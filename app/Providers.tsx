"use client";
import { ThemeProvider } from "@/components/custom/theme-provider";
import { Provider as JotaiProvider } from "jotai";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
      </ThemeProvider>
    </JotaiProvider>
  );
}
