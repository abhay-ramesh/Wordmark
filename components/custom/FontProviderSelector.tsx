"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAvailableProviders,
  loadFontsByProvider,
} from "@/lib/fontProviders";
import { useEffect, useState } from "react";

// Load only custom fonts by default for initial fast loading
const initCustomFonts = () => {
  if (typeof window !== "undefined") {
    loadFontsByProvider("custom");
  }
};

// Initialize custom fonts on module load
initCustomFonts();

interface FontProviderSelectorProps {
  className?: string;
  onChange?: (provider: string) => void;
}

// Provider display names
const providerNames = {
  google: "Google",
  adobe: "Adobe",
  fontSquirrel: "Font Squirrel",
  custom: "Custom",
  fontSource: "Fontsource",
  all: "All",
};

export function FontProviderSelector({
  className,
  onChange,
}: FontProviderSelectorProps) {
  // Get available providers
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  // Load providers list
  useEffect(() => {
    const providers = getAvailableProviders();
    // Add "all" option to the available providers
    setAvailableProviders(["all", ...providers]);
  }, []);

  // Default to first available provider
  const [activeProvider, setActiveProvider] = useState<string>(
    availableProviders[0] || "custom",
  );

  // Set active provider when available providers change
  useEffect(() => {
    if (
      availableProviders.length > 0 &&
      !availableProviders.includes(activeProvider)
    ) {
      setActiveProvider(availableProviders[0]);
    }
  }, [availableProviders, activeProvider]);

  // Handle provider change
  const handleProviderChange = (value: string) => {
    setActiveProvider(value);

    // Load fonts for this provider (except for "all" which will be handled differently)
    if (value !== "all") {
      loadFontsByProvider(value);
    }

    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className={className}>
      <Tabs
        defaultValue={activeProvider}
        className="w-full"
        onValueChange={handleProviderChange}
      >
        <TabsList
          className="grid h-8 w-full bg-muted/50 p-0.5"
          style={{
            gridTemplateColumns: `repeat(${
              availableProviders.length || 1
            }, 1fr)`,
          }}
        >
          {availableProviders.map((provider) => (
            <TabsTrigger
              key={provider}
              value={provider}
              className="h-7 px-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-none"
            >
              {providerNames[provider as keyof typeof providerNames]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
