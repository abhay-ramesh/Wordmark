"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { textAtom } from "@/lib/statemanager";
import { Command } from "cmdk";
import { useAtom } from "jotai";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Image,
  Layout,
  Moon,
  Shuffle,
  Square,
  Sun,
  Type,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import * as React from "react";

// Style for the Command Menu
import "./CommandPalette.css";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRandomFont: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onRandomFont,
}: CommandPaletteProps) {
  const router = useRouter();
  const [textState, setTextState] = useAtom(textAtom);
  const { theme, setTheme } = useTheme();
  const commandRef = React.useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = React.useState("");

  // This is to reset the input value when the dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  // Font size adjustment
  const increaseFontSize = React.useCallback(() => {
    setTextState((prev) => ({ ...prev, size: Math.min(prev.size + 1, 72) }));
  }, [setTextState]);

  const decreaseFontSize = React.useCallback(() => {
    setTextState((prev) => ({ ...prev, size: Math.max(prev.size - 1, 12) }));
  }, [setTextState]);

  // Function to navigate to different tabs
  const navigateToTab = React.useCallback(
    (tab: string) => {
      // Find the tab group
      const tabsElement = document.querySelector('[role="tablist"]');
      if (!tabsElement) return;

      // Find the tab button by its value
      const tabButton = Array.from(
        tabsElement.querySelectorAll('[role="tab"]'),
      ).find(
        (el) =>
          el.getAttribute("data-value") === tab ||
          (el as HTMLElement).innerText
            .toLowerCase()
            .includes(tab.toLowerCase()),
      );

      if (tabButton) {
        // Click the tab button
        (tabButton as HTMLElement).click();
        // Close the command palette
        onOpenChange(false);
      }
    },
    [onOpenChange],
  );

  const downloadDesign = React.useCallback(() => {
    // Find and click the download button
    const downloadButton =
      document.querySelector('[data-testid="download-button"]') ||
      document.querySelector('[data-action="download"]');
    if (downloadButton) {
      (downloadButton as HTMLElement).click();
      onOpenChange(false);
    }
  }, [onOpenChange]);

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
    onOpenChange(false);
  }, [theme, setTheme, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] gap-0 p-0 shadow-xl">
        <Command
          ref={commandRef}
          className="rounded-lg bg-background"
          value={inputValue}
          onValueChange={setInputValue}
          filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <div className="flex items-center border-b px-3">
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-12 w-full flex-1 rounded-md bg-transparent py-3 outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            {!inputValue && (
              <Command.Group heading="Suggestions">
                <Command.Item
                  onSelect={() => {
                    onRandomFont();
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm aria-selected:bg-accent"
                >
                  <Shuffle className="h-4 w-4" />
                  <span>Random Font</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => {
                    downloadDesign();
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm aria-selected:bg-accent"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Design</span>
                </Command.Item>

                <Command.Item
                  onSelect={toggleTheme}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm aria-selected:bg-accent"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span>Toggle Theme</span>
                </Command.Item>
              </Command.Group>
            )}

            <Command.Group heading="Navigation">
              <Command.Item
                onSelect={() => {
                  navigateToTab("text");
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm aria-selected:bg-accent"
              >
                <Type className="h-4 w-4" />
                <span>Go to Text Tab</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  navigateToTab("icon");
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm aria-selected:bg-accent"
              >
                <Image className="h-4 w-4" />
                <span>Go to Icon Tab</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  navigateToTab("card");
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm aria-selected:bg-accent"
              >
                <Square className="h-4 w-4" />
                <span>Go to Card Tab</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  navigateToTab("layout");
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm aria-selected:bg-accent"
              >
                <Layout className="h-4 w-4" />
                <span>Go to Layout Tab</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Typography">
              <Command.Item
                onSelect={() => {
                  increaseFontSize();
                  onOpenChange(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm aria-selected:bg-accent"
              >
                <ArrowUp className="h-4 w-4" />
                <span>Increase Font Size</span>
                <kbd className="ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                  ⌘↑
                </kbd>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  decreaseFontSize();
                  onOpenChange(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm aria-selected:bg-accent"
              >
                <ArrowDown className="h-4 w-4" />
                <span>Decrease Font Size</span>
                <kbd className="ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                  ⌘↓
                </kbd>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="External">
              <Command.Item
                onSelect={() => {
                  window.open(
                    "https://github.com/abhay-ramesh/wordmark",
                    "_blank",
                  );
                  onOpenChange(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm aria-selected:bg-accent"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                <span>GitHub Repository</span>
              </Command.Item>
            </Command.Group>

            <Command.Empty className="py-6 text-center text-sm">
              No commands found...
            </Command.Empty>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
