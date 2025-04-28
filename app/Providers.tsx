"use client";
import { ThemeProvider } from "@/components/custom/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useState } from "react";

if (
  process.env.NEXT_PUBLIC_POSTHOG_ENABLED === "true" ||
  process.env.NODE_ENV === "production"
) {
  if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    });
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance for React Query
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <JotaiProvider>
      {process.env.NEXT_PUBLIC_ENABLE_POSTHOG === "true" ? (
        <PostHogProvider client={posthog}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
            </ThemeProvider>
          </QueryClientProvider>
        </PostHogProvider>
      ) : (
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      )}
    </JotaiProvider>
  );
}
