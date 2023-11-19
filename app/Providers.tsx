"use client";
import { ThemeProvider } from "@/components/custom/theme-provider";
import { Provider as JotaiProvider } from "jotai";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <PostHogProvider client={posthog}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </PostHogProvider>
    </JotaiProvider>
  );
}
