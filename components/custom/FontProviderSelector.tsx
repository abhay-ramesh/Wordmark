"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  google: "Google Fonts",
  adobe: "Adobe Fonts",
  fontSquirrel: "Font Squirrel",
  custom: "Custom Fonts",
  fontSource: "Fontsource",
  openFoundry: "Open Foundry",
  all: "All Fonts",
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
    availableProviders[0] || "all",
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
      <Select value={activeProvider} onValueChange={handleProviderChange}>
        <SelectTrigger className="h-9 bg-background/70">
          <SelectValue placeholder="Select font provider" />
        </SelectTrigger>
        <SelectContent>
          {availableProviders.map((provider) => (
            <SelectItem key={provider} value={provider}>
              {providerNames[provider as keyof typeof providerNames]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
